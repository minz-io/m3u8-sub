import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
    colorize: true,
    ignore: "hostname,pid",
    translateTime: 'SYS:mm-dd HH:MM:ss.l',
});

const logger = pino(
    {},
    stream
)

export default logger
