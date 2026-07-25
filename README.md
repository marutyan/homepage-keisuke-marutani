# Keisuke Marutani Portfolio

## 公開URL

- English: https://marutyan.github.io/homepage-keisuke-marutani/index.html
- 日本語: https://marutyan.github.io/homepage-keisuke-marutani/index.ja.html
- Timeline: https://marutyan.github.io/homepage-keisuke-marutani/archive.html
- 経歴: https://marutyan.github.io/homepage-keisuke-marutani/archive.ja.html

## ローカル開発

```bash
npm install --no-audit --no-fund
npm run build
npm test
```

Eleventyは`src/`から公開用の`_site/`を生成します。Playwrightは生成後の`_site/`を対象に、日英ページ、テーマ、レスポンシブ表示、主要導線を検証します。

## デプロイ

`master`へのpushまたはGitHub Actionsの手動実行により、検証済みの`_site/`をGitHub Pagesへ展開します。Pull Requestではbuildとブラウザ検証のみを実行し、公開環境へのdeployは行いません。

GitHub Pagesの公開元は **GitHub Actions** に設定します。
