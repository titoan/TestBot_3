let TelegramBot = require("node-telegram-bot-api");
require('dotenv').config();
let XLSX = require("xlsx");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let workbook = XLSX.readFile("data/myData.xlsx");
let worksheet = workbook.Sheets.Page1;

let numberToolsCell = workbook.Sheets.Page1.B2.v;
let allTools = workbook.Sheets.Page1.B1.v
let toolsCount = numberToolsCell;

bot.onText(/\/start/, (ctx) => {
  const chatId = ctx.chat.id;
  bot.sendMessage(chatId, "Здоров, чувак, выбирай опцию", {
    reply_markup: {
      keyboard: [["Cчетчик сделанных инструментов", "Информация о работе"]],
    },
  });
});

bot.on("message", (ctx) => {
  const chatId = ctx.chat.id;
  if (ctx.text === "Cчетчик сделанных инструментов") {
    getCount(chatId);
    countKeyboard();
  } else if(ctx.text === "Информация о работе"){
    bot.sendMessage(chatId, `<b>Надо сделать всего</b>: ${allTools}
-------------------------------------
<b>Сделано</b>: ${toolsCount}
-------------------------------------
<b>Осталось</b>: ${allTools - toolsCount}`,{ parse_mode: "HTML" })
  }
});

function countKeyboard(){
  bot.on("callback_query", (ctx) => {
    const chatId = ctx.from.id;
    
    if (ctx.data === "countUp") {      
      toolsCount++;      
      getCount(chatId);
    } else if (ctx.data === "countDown") {
      toolsCount--;
      getCount(chatId);
    } else if (ctx.data === "getWriteToolsNumber") {
      getWriteToTable();
    }else if(ctx.data === "dropCount"){    
      dropCount(chatId);      
    }
  });
}


async function dropCount(chatId){
 await bot.sendMessage(chatId, 'Чувак, ты уверен?',{
    reply_markup:{
      inline_keyboard:[
        [{
          text: "Да, более чем",
          callback_data: "dropCountYeas"
        }],
        [
          {
            text:"Ну, чет как-то не очень",
            callback_data: "dropCountNope"
          }
        ]
      ]
    }
  })  

bot.on('callback_query', async ctx=>{
    let chatId = ctx.from.id
    if(ctx.data === "dropCountYeas"){      
      await XLSX.utils.sheet_add_aoa(worksheet, [[0]], { origin: "B2" });
      toolsCount = workbook.Sheets.Page1.B2.v;
      await getCount(chatId);
    }else if(ctx.data === "dropCountNope"){
      await bot.sendMessage(chatId, "Ну нет,так нет");    
    }
  })
}



function getWriteToTable() {  
  XLSX.utils.sheet_add_aoa(worksheet, [[toolsCount]], { origin: "B2" });  
  XLSX.writeFile(workbook, "data/myData.xlsx");
}

function getCount(chatId) {
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