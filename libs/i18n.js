import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStoragePlugin from 'i18next-react-native-async-storage';

i18n
  // detect user language
  // key = @i18next-async-storage/user-language
  .use(AsyncStoragePlugin('th'))
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    // fallbackLng: 'en',
    // lng: 'th',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          Username: 'Username',
          Email: 'Email',
          time: {
            MinuteAbbr: 'min',
            In: 'In',
            At: 'At',
          },
          signin: {
            Title: 'Sign In',
            Loading: 'Working...',
            SubmitLabel: 'Log in',
            UsernamePlaceHolder: 'Username',
            PasswordPlaceHolder: 'Password',
          },
          profile: {
            Title: 'Profile',
            SignOutButtonLabel: 'Sign out',
            InformationHeader: 'Information',
            JobTotal: 'Job Total',
            JobHistoryTitle: 'Job History',
            JobHistoryButtonLabel: 'Job history',
          },
          jobList: {
            Title: 'Job Queue',
            EmptyJob: 'No job at the moment, Yay!',
            InactiveFeed: 'This feed is not live yet',
          },
          job: {
            Title: 'Job',
            Cancelled: 'Cancalled',
            Passed: 'Anytime now',
            ID: 'Job ID',
            navigate: 'Navigate',
            PickupInformation: 'Pickup Information',
            ActiveStatus: 'ACTIVE',
            InactiveStatus: 'INACTIVE',
            StartButtonLabel: 'START',
            PickUpButtonLabel: 'PICK UP',
            DropOffButtonLabel: 'DROP OFF',
            FeedbackButtonLabel: 'FEEDBACK',
            AcceptJobQuestion: 'Accept the job?',
            PickUpQuestion: 'Pick up your customer?',
            DropOffQuestion: 'Drop the customer off at the destination?',
            FeedbackQuestion: 'Your feedback is valuable to us',
            FeedbackRating1: 'Bad',
            FeedbackRating2: 'Meh',
            FeedbackRating3: 'OK',
            FeedbackRating4: 'Good',
            FeedbackRating5: 'Excellent',
            WorkingInitButtonLabel: 'Start working',
          },
          modal: {
            Confirm: 'Confirm',
          },
        },
      },
      th: {
        translation: {
          Username: 'ชื่อผู้ใช้',
          Email: 'อีเมล์',
          time: {
            MinuteAbbr: 'นาที',
            In: 'อีก',
            At: 'เมื่อ',
          },
          signin: {
            Title: 'เข้าระบบ',
            Loading: 'กำลังประมวลผล...',
            SubmitLabel: 'เข้าสู่ระบบ',
            UsernamePlaceHolder: 'ชื่อผู้ใช้',
            PasswordPlaceHolder: 'พาสด์เวิร์ด',
          },
          profile: {
            Title: 'บัญชีของฉัน',
            SignOutButtonLabel: 'ออกจากระบบ',
            InformationHeader: 'ข้อมูลส่วนตัว',
            JobTotal: 'จำนวนงาน',
            JobHistoryTitle: 'ประวัติงาน',
            JobHistoryButtonLabel: 'ประวัติงาน',
          },
          jobList: {
            Title: 'คิวงาน',
            EmptyJob: 'ยังไม่มีงาน ณ ขณะนี้',
            InactiveFeed: 'ยังไม่เริ่มทำงาน',
          },
          job: {
            Title: 'งาน',
            Cancelled: 'ยกเลิก',
            Passed: 'เลยเวลาจองแล้ว',
            PickupInformation: 'รายละเอียดผู้โดยสาร',
            ID: 'รหัสงาน',
            ActiveStatus: 'ACTIVE',
            navigate: 'นำทาง',
            InactiveStatus: 'INACTIVE',
            StartButtonLabel: 'เริ่ม',
            PickUpButtonLabel: 'รับผู้โดยสาร',
            DropOffButtonLabel: 'ส่งผู้โดยสาร',
            FeedbackButtonLabel: 'ส่งคะแนนความพึงพอใจ',
            AcceptJobQuestion: 'รับงานนี้?',
            PickUpQuestion: 'รับผู้โดยสารแล้ว?',
            DropOffQuestion: 'ส่งผู้โดยสารแล้ว?',
            FeedbackQuestion: 'คะแนนความพึงพอใจมีค่าในการประเมินผลต่อๆไป',
            FeedbackRating1: 'แย่',
            FeedbackRating2: 'ควรปรับปรุง',
            FeedbackRating3: 'พอใช้',
            FeedbackRating4: 'ดี',
            FeedbackRating5: 'ดีมาก',
            WorkingInitButtonLabel: 'เริ่มงาน',
          },
          modal: {
            Confirm: 'ยืนยัน',
          },
        },
      },
    },
  });

export default i18n;
