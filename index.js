const mineflayer = require("mineflayer");
const keepAlive = require("./keep_alive");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const collectBlock = require("mineflayer-collectblock").plugin;
const fs = require("fs");

let botRunning = false;
const path = "./player_times.json";
const xpPath = "./player_xp.json";

let playerJoinTimes = {};
let playerTimes = {};
let playerXP = {};

// 🟦 تحميل البيانات
function loadTimes() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
  return JSON.parse(fs.readFileSync(path));
}

function saveTimes(times) {
  fs.writeFileSync(path, JSON.stringify(times, null, 2));
}

function loadXP() {
  if (!fs.existsSync(xpPath)) fs.writeFileSync(xpPath, "{}");
  return JSON.parse(fs.readFileSync(xpPath));
}

function saveXP(xpData) {
  fs.writeFileSync(xpPath, JSON.stringify(xpData, null, 2));
}

playerTimes = loadTimes();
playerXP = loadXP();

function startBot() {
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

  botRunning = true;
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);

  let followTarget = null;

  bot.on("spawn", () => {
    if (!bot.player || !bot.player.entity) {
      console.log("⚠️ متصل بس مفيش عالم. ممكن السيرفر لسه بيشتغل أو مقفول.");
      return;
    }

    console.log("✅ البوت دخل السيرفر!");
    bot.chat("ana bot");

    const movements = ["forward", "back", "left", "right"];
    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    setInterval(() => {
      const move = movements[Math.floor(Math.random() * movements.length)];
      bot.setControlState(move, true);
      setTimeout(() => bot.setControlState(move, false), 1000);
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 500);

      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      bot.look(yaw, pitch, true);
      bot.swingArm();
      if (Math.random() > 0.5) bot.chat(" انا هنا شغال");
    }, 30000);
  });

  // 🟦 تتبع وقت الدخول
  bot.on("playerJoined", (player) => {
    if (!player?.username || player.username === bot.username) return;
    playerJoinTimes[player.username] = Date.now();
  });

  // 🟥 تتبع وقت الخروج
  bot.on("playerLeft", (player) => {
    if (!player?.username || player.username === bot.username) return;
    const joinTime = playerJoinTimes[player.username];
    if (!joinTime) return;
    const sessionTime = Math.floor((Date.now() - joinTime) / 1000);
    playerTimes[player.username] = (playerTimes[player.username] || 0) + sessionTime;
    saveTimes(playerTimes);
    delete playerJoinTimes[player.username];
  });

  // 💾 الحفظ التلقائي كل دقيقة + XP
  setInterval(() => {
    const now = Date.now();
    for (const username in playerJoinTimes) {
      const joinTime = playerJoinTimes[username];
      const sessionTime = Math.floor((now - joinTime) / 1000);
      playerTimes[username] = (playerTimes[username] || 0) + sessionTime;
      playerJoinTimes[username] = now;

      // 🎁 XP: أضف 10 XP لكل دقيقة
      playerXP[username] = (playerXP[username] || 0) + 10;
    }

    saveTimes(playerTimes);
    saveXP(playerXP);
  }, 60000);

  bot.on("chat", async (username, message) => {
    if (username === bot.username) return;
    const msg = message.toLowerCase();

    if (msg.includes("ابو علي")) {
      bot.chat(`عاوز ايه يا ${username}؟ 😐`);
    }

    if (msg === "top10") {
      const sorted = Object.entries(playerTimes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      if (sorted.length === 0) return bot.chat("📭 لا يوجد بيانات بعد!");
      bot.chat("🏆 أفضل 10 لاعبين من حيث الوقت:");
      sorted.forEach(([user, secs], index) => {
        const minutes = Math.floor(secs / 60);
        bot.chat(`#${index + 1} - ${user}: ${minutes} دقيقة`);
      });
    }

    if (msg === "xp") {
      const xp = playerXP[username] || 0;
      bot.chat(`📊 ${username}، عندك ${xp} نقطة XP.`);
    }
  });

  // متابعة اللاعب المستهدف
  setInterval(() => {
    if (followTarget) {
      bot.pathfinder.setGoal(new goals.GoalFollow(followTarget, 1), true);
    }
  }, 5000);

  bot.on("end", () => {
    console.log("❌ البوت خرج من السيرفر! هيحاول يدخل تاني بعد دقيقتين...");
    botRunning = false;
    setTimeout(startBot, 120000);
  });

  bot.on("error", (err) => {
    console.error("❌ حصل Error:", err);
    console.log("⏳ هيجرب يدخل تاني بعد دقيقتين...");
    botRunning = false;
    setTimeout(startBot, 120000);
  });
}

startBot();
