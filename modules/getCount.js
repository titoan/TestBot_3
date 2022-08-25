function getCount(chatId,bot, toolsCount) {
  bot.sendMessage(chatId, `Готово всего: ${toolsCount}`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "+",
            callback_data: "countUp",
          },
          {
            text: "-",
            callback_data: "countDown",
          },
        ],
        [
          {
            text: "Записать в таблицу",
            callback_data: "getWriteToolsNumber",
          },
        ],
        [
          {
          text: "Обнулить",
          callback_data: "dropCount"

          }
        ]
      ],
    },
  });
}

  module.exports = getCount;
