# へへおくん

ブラウザで遊べる横スクロールアクションゲームです。

## GitHub Pages で公開する手順

1. このフォルダの中身を GitHub リポジトリにアップロードします。
2. GitHub の `Settings` -> `Pages` を開きます。
3. `Deploy from a branch` を選び、`main` ブランチの `/root` を指定します。
4. 公開URLの `index.html` がゲーム本体です。

## ローカル確認

`fetch()` で `sprites.json` を読むため、ローカルでは `file://` 直開きではなく簡易サーバーで確認してください。

```sh
python3 -m http.server 8765
```

その後、ブラウザで `http://localhost:8765/` を開きます。
