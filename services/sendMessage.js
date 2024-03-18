const EventEmitter = require('events');
const { createConnection } = require('typeorm');
const OnlineClass = require('path/to/OnlineClass');
const Kavenegar = require('kavenegar');
const cron = require('node-cron');

const apiKey = 'YOUR_KAVENEGAR_API_KEY'; 
class ClassEventEmitter extends EventEmitter {}

const classEventEmitter = new ClassEventEmitter();

const sendSMS = (phoneNumber, message) => {
  const api = Kavenegar.KavenegarApi({ apiKey });
  api.Send({
    message,
    receptor: phoneNumber,
    sender: 'YOUR_SENDER_NUMBER', 
  }, (response, status) => {
    console.log(response);
    console.log(status);
  });
};

const main = async () => {
  try {
    const connection = await createConnection(require('./typeorm-config'));
    const onlineClassesRepository = connection.getRepository(OnlineClass);

    const classes = await onlineClassesRepository.find();

    classes.forEach((onlineClass) => {
      const { start, title, phoneNumber } = onlineClass;

      cron.schedule(start, () => {
        const message = `Reminder: Your class "${title}" is starting now.`;
        sendSMS(phoneNumber, message);

        
        classEventEmitter.emit('classStart', onlineClass);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

main();

module.exports = classEventEmitter;
