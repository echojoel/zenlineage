import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import type { RawMaster } from "../scripts/scraper-types";

const ORIGINALS_CURATED_PATH = path.resolve(
  __dirname,
  "../scripts/data/raw/originals-curated.json"
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
    const teacherByName = new Map(rows.map((row) => [row.name, row.teachers[0]?.name ?? null]));

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

  it("contains high-confidence downstream branch spines", () => {
    const rows = loadOriginalsCurated();
    const teacherByName = new Map(rows.map((row) => [row.name, row.teachers[0]?.name ?? null]));

    expect(teacherByName.get("Yuquan Shenxiu")).toBe("Daman Hongren");
    expect(teacherByName.get("Songshan Puji")).toBe("Yuquan Shenxiu");
    expect(teacherByName.get("Jingzhong Wuxiang")).toBe("Yuquan Shenxiu");
    expect(teacherByName.get("Jingzhong Shenhui")).toBe("Jingzhong Wuxiang");
    expect(teacherByName.get("Shengshou Nanyin")).toBe("Jingzhong Shenhui");
    expect(teacherByName.get("Suizhou Daoyuan")).toBe("Shengshou Nanyin");
    expect(teacherByName.get("Niutou Farong")).toBe("Dayi Daoxin");
    expect(teacherByName.get("Heze Shenhui")).toBe("Dajian Huineng");
    expect(teacherByName.get("Nanyang Huizhong")).toBe("Dajian Huineng");
    expect(teacherByName.get("Yongjia Xuanjue")).toBe("Dajian Huineng");

    expect(teacherByName.get("Guishan Lingyou")).toBe("Baizhang Huaihai");
    expect(teacherByName.get("Xitang Zhizang")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Yanguan Qian")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Damei Fachang")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Guizong Zhichang")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Mayu Baoche")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Panshan Baoji")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Yangshan Huiji")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Xiangyan Zhixian")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Chuanzi Decheng")).toBe("Yaoshan Weiyan");
    expect(teacherByName.get("Jiashan Shanhui")).toBe("Chuanzi Decheng");
    expect(teacherByName.get("Luopu Yuanan")).toBe("Jiashan Shanhui");
    expect(teacherByName.get("Daowu Yuanzhi")).toBe("Yaoshan Weiyan");
    expect(teacherByName.get("Shishuang Qingzhu")).toBe("Daowu Yuanzhi");
    expect(teacherByName.get("Jiufeng Daoqian")).toBe("Shishuang Qingzhu");

    expect(teacherByName.get("Changqing Huileng")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Xuansha Shibei")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Luohan Guichen")).toBe("Xuansha Shibei");
    expect(teacherByName.get("Fayan Wenyi")).toBe("Luohan Guichen");
    expect(teacherByName.get("Tiantai Deshao")).toBe("Fayan Wenyi");
    expect(teacherByName.get("Yongming Yanshou")).toBe("Tiantai Deshao");

    expect(teacherByName.get("Dongshan Shouchu")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Xianglin Chengyuan")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Zhimen Guangzuo")).toBe("Xianglin Chengyuan");
    expect(teacherByName.get("Xuedou Chongxian")).toBe("Zhimen Guangzuo");
    expect(teacherByName.get("Tianyi Yihuai")).toBe("Xuedou Chongxian");
    expect(teacherByName.get("Baling Haojian")).toBe("Dongshan Shouchu");

    expect(teacherByName.get("Nanyuan Huiyong")).toBe("Xinghua Cunjiang");
    expect(teacherByName.get("Fengxue Yanzhao")).toBe("Nanyuan Huiyong");
    expect(teacherByName.get("Shoushan Xingnian")).toBe("Fengxue Yanzhao");
    expect(teacherByName.get("Fenyang Shanzhao")).toBe("Shoushan Xingnian");
    expect(teacherByName.get("Shishuang Chuyuan")).toBe("Fenyang Shanzhao");
    expect(teacherByName.get("Yangqi Fanghui")).toBe("Shishuang Chuyuan");
    expect(teacherByName.get("Huanglong Huinan")).toBe("Shishuang Chuyuan");
    expect(teacherByName.get("Yunan Kewen")).toBe("Huanglong Huinan");
    expect(teacherByName.get("Huitang Zuxin")).toBe("Huanglong Huinan");
    expect(teacherByName.get("Doushuai Congyue")).toBe("Huitang Zuxin");
    expect(teacherByName.get("Taiping Huiqin")).toBe("Doushuai Congyue");
    expect(teacherByName.get("Huguo Jingyuan")).toBe("Taiping Huiqin");
    expect(teacherByName.get("Baiyun Shouduan")).toBe("Yangqi Fanghui");
    expect(teacherByName.get("Wuzu Fayan")).toBe("Baiyun Shouduan");
    expect(teacherByName.get("Foyan Qingyuan")).toBe("Wuzu Fayan");
    expect(teacherByName.get("Yuanwu Keqin")).toBe("Wuzu Fayan");
    expect(teacherByName.get("Dahui Zonggao")).toBe("Yuanwu Keqin");
    expect(teacherByName.get("Zhuan Shigui")).toBe("Dahui Zonggao");
    expect(teacherByName.get("Poan Zuxian")).toBe("Zhuan Shigui");
    expect(teacherByName.get("Wuzhun Shifan")).toBe("Poan Zuxian");
    expect(teacherByName.get("Yuelin Shiguan")).toBe("Wuzhun Shifan");
    expect(teacherByName.get("Wumen Huikai")).toBe("Yuelin Shiguan");

    expect(teacherByName.get("Tongan Guanzhi")).toBe("Yunju Daoying");
    expect(teacherByName.get("Tongan Daopi")).toBe("Yunju Daoying");
    expect(teacherByName.get("Liangshan Yuanguan")).toBe("Tongan Guanzhi");
    expect(teacherByName.get("Dayang Jingxuan")).toBe("Liangshan Yuanguan");
    expect(teacherByName.get("Fushan Fayuan")).toBe("Dayang Jingxuan");
    expect(teacherByName.get("Touzi Yiqing")).toBe("Fushan Fayuan");
    expect(teacherByName.get("Furong Daokai")).toBe("Touzi Yiqing");
    expect(teacherByName.get("Danxia Zichun")).toBe("Furong Daokai");
    expect(teacherByName.get("Zhenxie Qingliao")).toBe("Danxia Zichun");
    expect(teacherByName.get("Kumu Daocheng")).toBe("Zhenxie Qingliao");
    expect(teacherByName.get("Changlu Qingliao")).toBe("Danxia Zichun");
    expect(teacherByName.get("Tiantong Zongjue")).toBe("Changlu Qingliao");
    expect(teacherByName.get("Xuedou Zhijian")).toBe("Tiantong Zongjue");
    expect(teacherByName.get("Tiantong Rujing")).toBe("Xuedou Zhijian");
    expect(teacherByName.get("Hongzhi Zhengjue")).toBe("Kumu Daocheng");
    expect(teacherByName.get("Muzhou Daoming")).toBe("Huangbo Xiyun");
    expect(teacherByName.get("Zhangjing Huaiyun")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Lingyun Zhiqin")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Baoshou Yanzhao")).toBe("Linji Yixuan");
    expect(teacherByName.get("Changsha Jingcen")).toBe("Nanquan Puyuan");
    expect(teacherByName.get("Dayu Shouzhi")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Qinglin Shiqian")).toBe("Zhaozhou Congshen");
    expect(teacherByName.get("Jingqing Daofu")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Yanyang Shanxin")).toBe("Zhaozhou Congshen");
    expect(teacherByName.get("Baoen Xuanze")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Luoshan Daoxian")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Mingzhao Deqian")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Qingxi Hongjin")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Tianping Congyi")).toBe("Luoshan Daoxian");
    expect(teacherByName.get("Qinshan Wensui")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Shushan Kuangren")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Nanta Guangyong")).toBe("Shishuang Qingzhu");
    expect(teacherByName.get("Jingzhao Mihu")).toBe("Yangshan Huiji");
    expect(teacherByName.get("Guannan Daochang")).toBe("Shitou Xiqian");
    expect(teacherByName.get("Xingyang Qingrang")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Wufeng Changguan")).toBe("Xitang Zhizang");
    expect(teacherByName.get("Xiyuan Siming")).toBe("Baoshou Yanzhao");
    expect(teacherByName.get("Huguo Shoucheng")).toBe("Xiangyan Zhixian");
    expect(teacherByName.get("Baofeng Weizhao")).toBe("Xiangyan Zhixian");
    expect(teacherByName.get("Kaifu Daoning")).toBe("Wuzu Fayan");
    expect(teacherByName.get("Yuean Shanguo")).toBe("Yuanwu Keqin");
    expect(teacherByName.get("Dahong Zuzheng")).toBe("Huanglong Huinan");
    expect(teacherByName.get("Langye Huijue")).toBe("Shishuang Chuyuan");
    expect(teacherByName.get("Cuiyan Kezhen")).toBe("Shishuang Chuyuan");
    expect(teacherByName.get("Baoning Renyong")).toBe("Cuiyan Kezhen");
    expect(teacherByName.get("Xita Guangmu")).toBe("Linji Yixuan");
    expect(teacherByName.get("Zifu Rubao")).toBe("Xita Guangmu");
    expect(teacherByName.get("Xingyang Qingpou")).toBe("Xianglin Chengyuan");
    expect(teacherByName.get("Cizhou Faru")).toBe("Heze Shenhui");
    expect(teacherByName.get("Taiyuan Fu")).toBe("Shushan Kuangren");
    expect(teacherByName.get("Changshui Zixuan")).toBe("Fushan Fayuan");
    expect(teacherByName.get("Dagui Muzhe")).toBe("Furong Daokai");
    expect(teacherByName.get("Bajiao Huiqing")).toBe("Nanta Guangyong");
    expect(teacherByName.get("Shexian Guixing")).toBe("Fushan Fayuan");
    expect(teacherByName.get("Deshan Yuanmi")).toBe("Dongshan Shouchu");
    expect(teacherByName.get("Guizong Cezhen")).toBe("Fayan Wenyi");
    expect(teacherByName.get("Wang Yanbin")).toBe("Changqing Huileng");
    expect(teacherByName.get("Daguang Juhui")).toBe("Touzi Datong");
    expect(teacherByName.get("Danxia Tianran")).toBe("Shitou Xiqian");
    expect(teacherByName.get("Cuiwei Wuxue")).toBe("Danxia Tianran");
    expect(teacherByName.get("Touzi Datong")).toBe("Cuiwei Wuxue");
    expect(teacherByName.get("Gaoan Dayu")).toBe("Deshan Xuanjian");
    expect(teacherByName.get("Jiufeng Qin")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Yuantong Fashen")).toBe("Fushan Fayuan");
    expect(teacherByName.get("Longya Judun")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Moshan Liaoran")).toBe("Gaoan Dayu");
    expect(teacherByName.get("Sansheng Huiran")).toBe("Xinghua Cunjiang");
    expect(teacherByName.get("Sixin Wuxin")).toBe("Baiyun Shouduan");
    expect(teacherByName.get("Dasui Fazhen")).toBe("Fenyang Shanzhao");
    expect(teacherByName.get("Guishan Daan")).toBe("Baiyun Shouduan");
    expect(teacherByName.get("Mingan Rongxi")).toBe("Xuedou Chongxian");
    expect(teacherByName.get("Jinhua Juzhi")).toBe("Hangzhou Tianlong");
    expect(teacherByName.get("Hangzhou Tianlong")).toBe("Damei Fachang");
    expect(teacherByName.get("Juefan Huihong")).toBe("Zhenjing Kewen");
    expect(teacherByName.get("Nanpu Shaoming")).toBe("Xutang Zhiyu");
    expect(teacherByName.get("Baizhang Niepan")).toBe("Linji Yixuan");
    expect(teacherByName.get("Chongshou Qichou")).toBe("Chuanzi Decheng");
    expect(teacherByName.get("Zizhou Zhishen")).toBe("Baotang Wuzhu");
    expect(teacherByName.get("Luzu Baoyun")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Mahasattva Fu")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Longji Shaoxiu")).toBe("Cuiwei Wuxue");
    expect(teacherByName.get("Fengxian Daochen")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Ruiyan Shiyan")).toBe("Yantou Quanhuo");
    expect(teacherByName.get("Wenshu Yingzhen")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Changfu Zhi")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Taigu Puyu")).toBe("Shiwu Qinggong");
    expect(teacherByName.get("Baofu Congzhan")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Zizhou Chuji")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Chengtian Chuanzong")).toBe("Yunmen Wenyan");
    expect(teacherByName.get("Dingzhou Shizang")).toBe("Shishuang Qingzhu");
    expect(teacherByName.get("Danyuan Yingzhen")).toBe("Nanyue Daoxuan");
    expect(teacherByName.get("Cuiyan Lingcan")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Yuezhou Qianfeng")).toBe("Dongshan Liangjie");
    expect(teacherByName.get("Pang Yun")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Wujiu Youxuan")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Yang Wuwei")).toBe("Furong Daokai");
    expect(teacherByName.get("Liu Tiemo")).toBe("Guishan Lingyou");
    expect(teacherByName.get("Zhongyi Hongen")).toBe("Mazu Daoyi");
    expect(teacherByName.get("Yantou Quanhuo")).toBe("Deshan Xuanjian");
    expect(teacherByName.get("Huanglong Huiji")).toBe("Huanglong Huinan");
    expect(teacherByName.get("Heshan Wuyin")).toBe("Jiufeng Daoqian");
    expect(teacherByName.get("Baoci Xingyan")).toBe("Fayan Wenyi");
    expect(teacherByName.get("Lianhua Fengxiang")).toBe("Xuefeng Yicun");
    expect(teacherByName.get("Zhenjing Kewen")).toBe("Huanglong Huinan");
    expect(teacherByName.get("Xutang Zhiyu")).toBe("Wuzhun Shifan");
    expect(teacherByName.get("Baotang Wuzhu")).toBe("Jingzhong Wuxiang");
    expect(teacherByName.get("Nanyue Daoxuan")).toBe("Shitou Xiqian");
    expect(teacherByName.get("Jianyuan")).toBe("Xutang Zhiyu");
    expect(teacherByName.get("Shiwu Qinggong")).toBe("Jianyuan");
  });
});
