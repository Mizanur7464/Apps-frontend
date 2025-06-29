import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

TOKEN = "8013081955:AAGDYLLBWwJ8OYllyDa0I3CGXCk8CuVKLpQ"
WEBAPP_URL = "https://apps-frontend-1ovv-git-main-mizanurs-projects-24e9ba9d.vercel.app/"

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("🚀 Open Mini App", web_app=WebAppInfo(url=WEBAPP_URL)))
    bot.send_message(message.chat.id, "Open the mini app by clicking the button below:", reply_markup=keyboard)

bot.polling() 