import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ScheduleDay } from "../../../types/schedule";

/**
 * 若你的 schedules 僅表示「週排班」，其中 dayOfWeek = 0~6 (Sunday~Saturday)，
 * 就可用此函式產生一份類似「一週排班總覽」的 PDF。
 *
 * @param schedules   - 包含 dayOfWeek、section、works 的排班資料
 * @param closedDays  - 休診日 (ex: [0, 6] 表示週日、週六休診)
 */
interface GenerateWeeklyCalendarPDFOptions {
  schedules: ScheduleDay[];
  closedDays: number[];
}

/**
 * 以 async 形式定義，因為我們要動態匯入字體 (lazy load)
 */
const generateWeeklyCalendarPDF = async ({
  schedules,
  closedDays,
}: GenerateWeeklyCalendarPDFOptions) => {
  if (!schedules || schedules.length === 0) {
    console.warn("沒有可用的班表資料，無法生成 PDF。請先提供 schedules。");
    return;
  }

  // 1. 動態匯入 (lazy load) 超大 Base64 字串
  //    注意：要與 fontBase64.ts 路徑對應。
  const { notoSerifTCBase64 } = await import("./fontBase64");

  // 2. 建立 jsPDF (A4 橫向)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // 3. 嵌入中文字體
  doc.addFileToVFS("NotoSerifTC-Regular.ttf", notoSerifTCBase64);
  doc.addFont("NotoSerifTC-Regular.ttf", "NotoSerifTC", "normal");
  doc.setFont("NotoSerifTC", "normal");

  // 4. 定義「日～六」表頭
  const dayOfWeekTexts = [
    "週日",
    "週一",
    "週二",
    "週三",
    "週四",
    "週五",
    "週六",
  ];

  // 5. 先以「section (name, startTime, endTime)」分組；每個 group 再以 dayOfWeek 彙整 works
  type DayToWorksMap = Record<number, ScheduleDay[]>;
  const groupMap: Record<string, DayToWorksMap> = {};

  schedules.forEach((item) => {
    const { dayOfWeek, section, works } = item;
    if (dayOfWeek == null) return;

    // 你可以視需要客製合併邏輯，例如：section name + time
    const sectionKey = `${section.name} (${section.startTime}-${section.endTime})`;

    if (!groupMap[sectionKey]) {
      groupMap[sectionKey] = {};
    }
    if (!groupMap[sectionKey][dayOfWeek]) {
      groupMap[sectionKey][dayOfWeek] = [];
    }

    // 把當前 schedule 放進對應 dayOfWeek
    groupMap[sectionKey][dayOfWeek].push(item);
  });

  // 6. 取得所有「sectionKey」並依實際時間排序（若需要）
  const sectionKeys = Object.keys(groupMap).sort((a, b) => {
    // 簡易根據 "startTime" 排序：
    // a = "早診 (09:00-12:00)" => 取到 "09:00"
    // b = "晚診 (18:00-21:00)" => 取到 "18:00"
    const aMatch = a.match(/\((\d{2}:\d{2})-/);
    const bMatch = b.match(/\((\d{2}:\d{2})-/);
    if (!aMatch || !bMatch) return a.localeCompare(b);
    return aMatch[1].localeCompare(bMatch[1]);
  });

  // 7. 構建表頭 (共 8 欄: "診間/時段" + 7 天)
  const head = [["診間 / 時段", ...dayOfWeekTexts]];

  // 8. 逐一走訪每個 sectionKey，組裝表格 body
  const body: string[][] = [];

  sectionKeys.forEach((sectionKey) => {
    const row: string[] = new Array(8).fill("");
    row[0] = sectionKey; // 第一欄放 sectionKey

    for (let day = 0; day < 7; day++) {
      if (closedDays.includes(day)) {
        // 若此日為休診日，直接標示「休診」
        row[day + 1] = "休診";
      } else {
        // 若非休診，檢查 groupMap[sectionKey][day]
        const daySchedules = groupMap[sectionKey][day] || [];
        if (daySchedules.length === 0) {
          // 沒有任何排班
          row[day + 1] = "-";
        } else {
          // 可能有多個 works
          let combinedText = "";
          daySchedules.forEach((schedule) => {
            const works = schedule.works || [];
            works.forEach((w) => {
              const doctorName = w.doctor?.name
                ? ` (醫師: ${w.doctor?.name})`
                : "";
              combinedText += `${w.name}${doctorName}\n`;
            });
          });
          row[day + 1] = combinedText.trim();
        }
      }
    }

    body.push(row);
  });

  // 若連 sectionKeys 都沒有，就代表資料中沒有任何 section，無法繪製
  if (body.length === 0) {
    console.warn("沒有可用的 section 資料，無法繪製表格。");
    return;
  }

  // 9. 使用 autoTable 繪製
  autoTable(doc, {
    head,
    body,
    startY: 20,
    styles: {
      font: "NotoSerifTC",
      fontSize: 9,
      cellPadding: 2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 40 }, // 第一欄(診間 / 時段)寬一點
    },
  });

  // 10. 加上表格標題
  doc.setFontSize(14);
  doc.text("週排班表", doc.internal.pageSize.getWidth() / 2, 10, {
    align: "center",
  });

  // 11. 存檔
  const today = new Date().toISOString().split("T")[0];
  doc.save(`WeeklySchedule_${today}.pdf`);
};

export default generateWeeklyCalendarPDF;
