let TelegramBot = require("node-telegram-bot-api");
require('dotenv').config();
let XLSX = require("xlsx");

//My Modules
let getCount = require('./modules/getCount');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let workbook = XLSX.readFile("data/myData.xlsx");
let worksheet = workbook.Sheets.Page1;

let numberToolsCell = workbook.Sheets.Page1.B2.v;
let allTools = workbook.Sheets.Page1.B1.v
let toolsCount = numberToolsCell;
let countInfoMsgId;

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
  countInfoMsgId = ctx.message_id;
  // console.log(countInfoMsgId)
  if (ctx.text === "Cчетчик сделанных инструментов") {
    bot.deleteMessage(chatId, ctx.message_id);     
    getCount(chatId, bot, toolsCount);
    countKeyboard();
  } else if(ctx.text === "Информация о работе"){
    bot.sendMessage(chatId, `<b>Надо сделать всего</b>: ${allTools}
-------------------------------------
<b>Сделано</b>: ${toolsCount}
-------------------------------------
<b>Осталось</b>: ${allTools - toolsCount}`,{ parse_mode: "HTML" })
  }
});

let countKeyboardListener = '';
function countKeyboard(){  
  bot.on("callback_query", (ctx) => {
    countKeyboardListener = ctx.id;
    
    const chatId = ctx.message.chat.id;
    bot.removeReplyListener(countKeyboardListener);
      if (ctx.data === "countUp") {      
        toolsCount++;
        bot.deleteMessage(chatId, ctx.message.message_id);           
        getCount(chatId, bot, toolsCount);
      } else if (ctx.data === "countDown") {
        toolsCount--;
        // bot.deleteMessage(chatId, ctx.message.message_id);
        getCount(chatId, bot, toolsCount);
      } else if (ctx.data === "getWriteToolsNumber") {
        bot.deleteMessage(chatId, ctx.message.message_id); 
        getWriteToTable(chatId);
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



bot.on('callback_query', ctx=>{
    let chatId = ctx.from.id

    try{
      if(ctx.data === "dropCountYeas"){        
        bot.deleteMessage(chatId, ctx.message.message_id);   
        XLSX.utils.sheet_add_aoa(worksheet, [[0]], { origin: "B2" });
        toolsCount = workbook.Sheets.Page1.B2.v;
        getCount(chatId, bot, toolsCount);
     }else if(ctx.data === "dropCountNope"){
      try{
        bot.deleteMessage(chatId, ctx.message.message_id); 
        bot.sendMessage(chatId, "Ну нет,так нет"); 
        getCount(chatId, bot, toolsCount);
      }catch(e){
        console.log(e)
      }
         
     }
    }catch(e){
      console.log(e)
    }

  })
}



function getWriteToTable(chatId) {  
  XLSX.utils.sheet_add_aoa(worksheet, [[toolsCount]], { origin: "B2" });  
  XLSX.writeFile(workbook, "data/myData.xlsx");
  bot.sendMessage(chatId, 'Данные в таблицу записаны');
  getCount(chatId, bot, toolsCount);
}

