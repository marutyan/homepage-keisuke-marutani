import type I18nKeys from "../locales/keys";

interface Configuration {
  title: string;
  subTitle: string;
  brandTitle: string;

  description: string;

  site: string;

  locale: "en" | "zh-CN" | "ja";

  navigators: { nameKey: I18nKeys; href: string; icon?: string }[];

  username: string;
  sign: string;
  avatarUrl: string;

  socialLinks: { icon: string; link: string }[];

  interestTags: string[];

  slugMode: "HASH" | "RAW";

  license: {
    name: string;
    url: string;
  };
}

export type { Configuration };
