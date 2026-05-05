# 力行國小 115 學年度職務選填電子板

直接開啟 `index.html` 即可使用。

使用流程：

1. 點選左側教師姓名。
2. 點選右側空白職務。
3. 確認無誤後按「確認」。
4. 選錯時按「取消」回到選取前狀態。
5. 「匯出結果」可複製目前職務表。
6. 「重設選填」會清除本次選填，保留 PDF 內已確認名單。
7. 「觀看版」會開啟只能查看、不能操作的結果頁。
8. 「管理板」可以新增/刪除名額、手動修改姓名、開放或暫停選填。

選填結果會儲存在同一台電腦、同一個瀏覽器的 localStorage。
觀看版會讀取同一份 localStorage，適合在同一台電腦開分頁或投影即時觀看；跨裝置即時同步需要另外接資料庫服務。

## Firebase 即時同步

此專案已預留 Firebase Realtime Database 同步設定。

1. 建立 Firebase 專案與 Realtime Database。
2. 將 Firebase Web App 設定填入 `firebase-config.js`。
3. 將 `database.rules.json` 套用到 Realtime Database。
4. 重新推送到 GitHub Pages。

目前規則範本允許公開讀寫 `boards/lixing-115/jobs`，適合校內臨時活動快速使用；若公開連結會廣泛流傳，建議改成登入驗證或加上管理密碼。
