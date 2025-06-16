const express = require('express'); // استدعاء مكتبة Express
const app = express();              // إنشاء تطبيق Express

// لما حد يزور عنوان السيرفر، يرد عليه برسالة
app.get('/', (req, res) => {
  res.send('Bot is alive!');        // الرد اللي بيرجع للمتصفح
});

// تشغيل السيرفر على البورت 3000
app.listen(3000, () => {
  console.log('Keep-alive server is running!');
});
