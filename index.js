const mineflayer = require("mineflayer");
const keepAlive = require("./keep_alive");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const collectBlock = require("mineflayer-collectblock").plugin;

let botRunning = false; // متغيّر لتتبع حالة البوت

function startBot() {
  // لو البوت شغّال بالفعل، منرجعش نبدأه تاني
  if (botRunning) {
    console.log("⚠️ البوت شغّال بالفعل، مش هيبدأ تاني.");
    return;
  }

  const bot = mineflayer.createBot({
    host: "HeartEconomy.aternos.me",
    port: 20611,
    username: "Abo_ali",
    version: "1.21.5",
  });

  botRunning = true; // تم تشغيل البوت

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);

  let followTarget = null;

  bot.on("spawn", () => {
    console.log("✅ البوت دخل السيرفر!");
    bot.chat("ana bot");

    const movements = ["forward", "back", "left", "right"];
    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    setInterval(() => {
      const move = movements[Math.floor(Math.random() * movements.length)];
      bot.setControlState(move, true);
      setTimeout(() => {
        bot.setControlState(move, false);
      }, 1000);

      bot.setControlState("jump", true);
      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 500);

      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      bot.look(yaw, pitch, true);
      bot.swingArm();

      if (Math.random() > 0.5) {
        bot.chat("انا هنا يلا منك ليه 😒");
      }
    }, 30000);
  });

  bot.on("chat", async (username, message) => {
    if (username === bot.username) return;
    const msg = message.toLowerCase();

    if (msg.includes("ابو علي")) {
      bot.chat(`عاوز ايه يا ${username}؟ 😐`);
    }

    // باقي الأوامر هنا...
  });

  setInterval(() => {
    if (followTarget) {
      bot.pathfinder.setGoal(new goals.GoalFollow(followTarget, 1), true);
    }
  }, 5000);

  bot.on("end", () => {
    console.log("❌ البوت خرج من السيرفر! هيحاول يدخل تاني بعد دقيقتين...");
    botRunning = false; // تم إيقاف البوت
    setTimeout(() => {
      startBot();
    }, 120000);
  });

  bot.on("error", (err) => {
    console.error("❌ حصل Error:", err);
    console.log("⏳ هيجرب يدخل تاني بعد دقيقتين...");
    botRunning = false; // حصل خطأ، مش شغّال
    setTimeout(() => {
      startBot();
    }, 120000);
  });
}

// 🟢 تشغيل البوت أول مرة
startBot();
