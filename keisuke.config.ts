import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const KeisukeConfig: Configuration = {
  title: "Keisuke's Portfolio",
  subTitle: "Computer Vision & Deep Learning",
  brandTitle: "Keisuke",

  description: "Personal portfolio and blog",

  site: "https://localhost:4321",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/about",
    },
    {
      nameKey: I18nKeys.nav_bar_github,
      href: "https://github.com/keisuke-marutani",
    },
  ],

  username: "Keisuke Marutani",
  sign: "Computer Vision & Deep Learning",
  avatarUrl: "https://s2.loli.net/2025/01/25/FPpTrQSezM8ivbl.webp",
  socialLinks: [
    {
      icon: "line-md:github-loop",
      link: "https://github.com/keisuke-marutani",
    },
    {
      icon: "mdi:linkedin",
      link: "https://linkedin.com/in/keisuke-marutani",
    },
    {
      icon: "mdi:twitter",
      link: "https://twitter.com/keisuke_m",
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

  banners: [
    "https://s2.loli.net/2025/01/25/PBvHFjr5yDu6t4a.webp",
    "https://s2.loli.net/2025/01/25/6bKcwHZigzlM4mJ.webp",
    "https://s2.loli.net/2025/01/25/H9WgEK6qNTcpFiS.webp",
    "https://s2.loli.net/2025/01/25/njNVtuUMzxs81RI.webp",
    "https://s2.loli.net/2025/01/25/tozsJ8QHAjFN3Mm.webp",
    "https://s2.loli.net/2025/01/25/Pm89OveZq7NWUxF.webp",
    "https://s2.loli.net/2025/01/25/UCYKvc1ZhgPHB9m.webp",
    "https://s2.loli.net/2025/01/25/JjpLOW8VSmufzlA.webp",
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default KeisukeConfig;
