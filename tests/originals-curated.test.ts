import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import type { RawMaster } from "../scripts/scraper-types";

const ORIGINALS_CURATED_PATH = path.resolve(
  __dirname,
  "../scripts/data/raw/originals-curated.json",
);

function loadOriginalsCurated(): RawMaster[] {
  return JSON.parse(fs.readFileSync(ORIGINALS_CURATED_PATH, "utf-8")) as RawMaster[];
}

describe("originals-curated overlay", () => {
  it("does not contain duplicate primary names", () => {
    const rows = loadOriginalsCurated();
    const names = rows.map((row) => row.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

    expect(duplicates).toEqual([]);
  });

  it("contains the core Chan bridge transmissions", () => {
    const rows = loadOriginalsCurated();
    const teacherByName = new Map(
      rows.map((row) => [row.name, row.teachers[0]?.name ?? null]),
    );

    expect(teacherByName.get("Dayi Daoxin")).toBe("Jianzhi Sengcan");
    expect(teacherByName.get("Daman Hongren")).toBe("Dayi Daoxin");
    expect(teacherByName.get("Dajian Huineng")).toBe("Daman Hongren");
    expect(teacherByName.get("Nanyue Huairang")).toBe("Dajian Huineng");
    expect(teacherByName.get("Qingyuan Xingsi")).toBe("Dajian Huineng");
    expect(teacherByName.get("Mazu Daoyi")).toBe("Nanyue Huairang");
    expect(teacherByName.get("Shitou Xiqian")).toBe("Qingyuan Xingsi");
    expect(teacherByName.get("Baizhang Huaihai")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Huangbo Xiyun")).toBe("Baizhang Huaihai");
    expect(teacherByName.get("Linji Yixuan")).toBe("Huangbo Xiyun");
    expect(teacherByName.get("Nanquan Puyuan")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Zhaozhou Congshen")).toBe("Nanquan Puyuan");
    expect(teacherByName.get("Yaoshan Weiyan")).toBe("Shitou Xiqian");
    expect(teacherByName.get("Yunyan Tansheng")).toBe("Yaoshan Weiyan");
    expect(teacherByName.get("Dongshan Liangjie")).toBe("Yunyan Tansheng");
    expect(teacherByName.get("Tianhuang Daowu")).toBe("Shitou Xiqian");
    expect(teacherByName.get("Longtan Chongxin")).toBe("Tianhuang Daowu");
    expect(teacherByName.get("Deshan Xuanjian")).toBe("Longtan Chongxin");
    expect(teacherByName.get("Xuefeng Yicun")).toBe("Deshan Xuanjian");
    expect(teacherByName.get("Yunmen Wenyan")).toBe("Xuefeng Yicun");
  });
});
