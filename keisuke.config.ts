import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const KeisukeConfig: Configuration = {
  title: "Marutyan's Portfolio",
  subTitle: "Computer Vision & Deep Learning",
  brandTitle: "Keisuke",

  description: "Personal portfolio and blog",

  site: "https://localhost:4321",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
      icon: "heroicons:home-solid",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
      icon: "heroicons:clock-solid",
    },
    {
      nameKey: I18nKeys.nav_bar_github,
      href: "https://github.com/marutyan/homepage-keisuke-marutani",
      icon: "line-md:github-loop",
    },
  ],

  username: "Keisuke Marutani",
  sign: "Computer Vision & Deep Learning",
  avatarUrl: "https://s2.loli.net/2025/01/25/FPpTrQSezM8ivbl.webp",
  socialLinks: [
    {
      icon: "line-md:github-loop",
      link: "https://github.com/marutyan",
    },
    {
      icon: "mdi:linkedin",
      link: "https://www.linkedin.com/in/keisuke-marutani-b91368354/",
    },
    {
      icon: "mdi:twitter",
      link: "https://x.com/marutyan_D_road",
    },
  ],

  interestTags: [
    "Computer Vision",
    "Deep Learning",
    "RT-DETR",
    "YOLO",
    "Object Detection",
    "Python",
    "PyTorch",
    "OpenCV",
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
};

export default KeisukeConfig;
