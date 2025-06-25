from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = "7911381363:AAF46PiidTRN_EcfiR2xJnFAiAuY2UHUHY8"  # BotFather থেকে পাওয়া টোকেন বসাও
WEBAPP_URL = "https://voucer-last-git-main-mizanurs-projects-24e9ba9d.vercel.app"  # এখানে তোমার React অ্যাপের লিঙ্ক বসাও

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🚀 Open Mini App", web_app={"url": WEBAPP_URL})]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("নিচের বাটনে ক্লিক করে মিনি অ্যাপ ওপেন করো:", reply_markup=reply_markup)

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling() 