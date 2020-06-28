import dayjs from "dayjs"
import calendar from "dayjs/plugin/calendar"
dayjs.extend(calendar)

export const bkkTime = dayStr => dayjs(dayStr).calendar()
