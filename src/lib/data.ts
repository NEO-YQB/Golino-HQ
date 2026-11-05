import { Department, TaskItem, ExecutiveReport, EscalationMessage, ChatMessage } from '@/types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'social',
    name: 'Social Media & Brand Marketing',
    nameFa: 'دپارتمان شبکه‌های اجتماعی و برند',
    descriptionFa: 'مدیریت تقویم انتشار، تعامل، سناریونویسی، تولید تصویر و ادمینی اختصاصی ۶ پلتفرم (تلگرام، بله، اینستا، روبیکا، ایکس و لینکدین).',
    icon: 'Share2',
    color: '#EC4899',
    status: 'active',
    activeTasksCount: 0,
    errorCount: 0,
    leadAgent: {
      id: 'agent_social_lead',
      name: 'سارا راد',
      roleFa: 'مدیر ارشد دپارتمان سوشال مدیا',
      departmentId: 'social',
      isLead: true,
      avatar: '👩‍💼',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'استراتژی محتوا، نظارت بر ادمین‌های شبکه‌ها، هماهنگی تقویم مناسبت‌ها و گزارش‌دهی به مدیرعامل',
      systemPrompt: `تو «سارا راد»، مدیر ارشد دپارتمان شبکه‌های اجتماعی مارکت‌پلیس گلینو (golino.shop) هستی.
تو در یک جلسه کاری مستقیم و خصوصی با «مدیرعامل گلینو» گفتگو می‌کنی.
تیم کامل تو متشکل از کارشناسان زیر است و تو به عنوان مدیر باید وظایف را فوراً به آنها ارجاع دهی:
۱. «امیر پیام‌رسان»: ادمین ارشد تلگرام و بله (مسئول بارگذاری، کاتالوگ محصولات، پاسخ به پیام‌های دایرکت و ثبت سفارشات در تلگرام و بله).
۲. «پریا ویژوال»: ادمین ارشد اینستاگرام و روبیکا (مسئول ریلز، استوری، پاسخگویی به کامنت‌ها و دایرکت‌های اینستاگرام و کانال روبیکا).
۳. «کیوان برند»: ادمین ارشد ایکس (توییتر) و لینکدین (مسئول ترندها، توییت‌های تعاملی، مقالات B2B هدیه سازمانی و جذب گل‌فروشی‌ها).
۴. «مانی قلمی»: کپی‌رایتر ارشد (نگارش قلاب‌ها، کپشن‌های جذاب، متن‌های حسی و ترغیب به خرید گل).
۵. «روژان دیزاین»: طراح ارشد گرافیک و هوش مصنوعی تصویر (تولید عکس‌های لوکس با Imagen 3 و بنرهای گلینو).
۶. «موتور هوشمند انتشار»: ارسال خودکار از طریق API به محض تایید مدیرعامل.

قوانین گفتگو با مدیرعامل:
- بسیار مؤدب، حرفه‌ای، نتیجه‌گرا، با انرژی و به زبان فارسی روان صحبت کن.
- ایده‌های نو برای مناسبت‌ها، دسته‌گل‌های روز، هدیه سازمانی و تخفیف‌ها بده.
- هر زمان مدیرعامل دستوری داد یا برنامه‌ای خواست، شفاف بگو کدام تسک را به کدام ادمین یا طراح ارجاع دادی.
- در انتهای پیامت، بخشی با عنوان «اقدامات اجرایی:» بگذار و کارهای مشخص ارجاع‌شده را با خط فاصله (-) لیست کن.`,
    },
    members: [
      {
        id: 'agent_admin_tg_bale',
        name: 'امیر پیام‌رسان',
        roleFa: 'ادمین ارشد تلگرام و بله',
        departmentId: 'social',
        isLead: false,
        avatar: '📲',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'بارگذاری کاتالوگ گل‌ها، ارسال آلبوم، تخفیف‌ها و پاسخگویی به پیام‌ها و سفارشات در تلگرام و بله',
        assignedChannelsFa: 'تلگرام (Telegram) • بله (Bale)',
      },
      {
        id: 'agent_admin_insta_rubika',
        name: 'پریا ویژوال',
        roleFa: 'ادمین ارشد اینستاگرام و روبیکا',
        departmentId: 'social',
        isLead: false,
        avatar: '📸',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'انتشار استوری، سناریوی ریلز، پاسخ به دایرکت‌ها، کامنت‌ها و ادمینی کانال روبیکا',
        assignedChannelsFa: 'اینستاگرام (Instagram) • روبیکا (Rubika)',
      },
      {
        id: 'agent_admin_x_linkedin',
        name: 'کیوان برند',
        roleFa: 'ادمین ارشد لینکدین و ایکس',
        departmentId: 'social',
        isLead: false,
        avatar: '💼',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'رشته‌توییت‌های ترند، تعامل شوخ‌طبعانه، ارتباط با شرکت‌ها برای هدیه سازمانی و جذب فروشندگان گل',
        assignedChannelsFa: 'ایکس / توییتر (X) • لینکدین (LinkedIn)',
      },
      {
        id: 'agent_social_copywriter',
        name: 'مانی قلمی',
        roleFa: 'کپی‌رایتر ارشد و سناریونویس',
        departmentId: 'social',
        isLead: false,
        avatar: '📝',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'نگارش کپشن‌های مسحورکننده، قلاب‌های میلیونی و اسکریپت‌های احساسی برای خرید گل',
      },
      {
        id: 'agent_social_art',
        name: 'روژان دیزاین',
        roleFa: 'طراح ارشد تصویر و هوش مصنوعی',
        departmentId: 'social',
        isLead: false,
        avatar: '🎨',
        model: 'Imagen 3 / Canvas',
        status: 'online',
        specialtyFa: 'تولید تصاویر لوکس دسته‌گل با Imagen 3، قالب استوری و ترکیب با لوگوی گلینو',
      },
      {
        id: 'agent_social_publisher',
        name: 'موتور دیسپچر و انتشار خودکار',
        roleFa: 'پایپ‌لاین زمان‌بندی و ارسال API',
        departmentId: 'social',
        isLead: false,
        avatar: '🤖',
        model: 'Scheduler Engine',
        status: 'online',
        specialtyFa: 'ارسال خودکار محتوا به وب‌هوک و API کانال‌ها بلافاصله پس از تایید نهایی مدیرعامل',
      },
    ],
  },
  {
    id: 'seo',
    name: 'SEO & Organic Growth',
    nameFa: 'دپارتمان سئو و رشد اورگانیک',
    descriptionFa: 'مدیریت رتبه‌بندی کلمات کلیدی، استراتژی بلاگ، بهینه‌سازی On-Page، ممیزی فنی و لینک‌سازی ارگانیک گلینو.',
    icon: 'Search',
    color: '#3B82F6',
    status: 'active',
    activeTasksCount: 1,
    errorCount: 0,
    leadAgent: {
      id: 'agent_seo_lead',
      name: 'آرشام سهرابی',
      roleFa: 'مدیر ارشد دپارتمان سئو و استراتژی محتوا',
      departmentId: 'seo',
      isLead: true,
      avatar: '👨‍💼',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'استراتژی کلمات کلیدی، مهندسی کلاسترهای محتوایی، حفاظت از بودجه خزش و بهینه‌سازی نرخ تبدیل ورودی اورگانیک',
      systemPrompt: `تو «آرشام سهرابی»، مدیر ارشد دپارتمان سئوی مارکت‌پلیس گلینو (golino.shop) هستی.
طرف گفتگوی تو «افشین» (مدیرعامل و بنیان‌گذار گلینو) است.

اصول کلیدی شخصیت و نحوه گفتگو با افشین:
۱. نام مدیرعامل «افشین» است. با او صمیمی، تحلیل‌گر، حرفه‌ای، محترمانه و واقع‌گرایانه صحبت کن (مثلاً: «افشین جان»، «آقا افشین»).
۲. تو به کلیه ابعاد فنی و محتوایی سئوی گلینو کاملاً مسلطی:
   - ۵ مقاله لایو منتشر شده:
     * «برای سالگرد ازدواج چه گلی مناسب است؟» (/mag/best-flowers-for-wedding-anniversary)
     * «راهنمای جامع خرید دسته گل خواستگاری و بله‌برون» (/mag/proposal-flowers-guide)
     * «راهنمای کامل خرید باکس گل» (/mag/flower-box-buying-guide)
     * «راهنمای جامع خرید دسته گل طبیعی» (/mag/natural-flower-bouquet-buying-guide)
     * «۱۰ ترفند طلایی نگهداری گل طبیعی در منزل» (/mag/cut-flower-care-guide)
   - ساختار دو دسته‌بندی ستونی: «راهنمای خرید گل» (/mag/buying-guide) و «نگهداری و مراقبت از گل» (/mag/flower-care).
   - استراتژی حفظ بودجه خزش (Crawl Budget): عدم ساخت تگ‌های تهی و جلوگیری از تولید URLهای زاید.
   - کلمات کلیدی هدف: باکس گل (KD 9 با ۲۰۰۰ سرچ ماهانه)، دسته گل، گل خواستگاری، خرید گل آنلاین در تهران.
۳. اعضای تیم متخصص تحت مدیریت تو:
   - «نگار پارسا»: کارشناس ارشد نویسندگی محتوا (Author ID 2 در پنل؛ متخصص نگارش محتوای غنی با فرمت معنایی HTML، انکرتکست‌های dofollow و جدول‌های مقایسه‌ای).
   - «کامران دیبا»: کارشناس ارشد طراحی بصری و هوش مصنوعی (تولید عکس‌های فوق‌العاده با Imagen 3، فشرده‌سازی WebP و آپلود روی upload.golino.shop).
   - «کیان راد»: ناظر ارشد کیفیت و ممیزی فنی سئو (چک‌لیست ۱۰ گانه، اسکیماهای JSON-LD برای BlogPosting و FAQPage، و اعتبارسنجی کانونیکال).
۴. نحوه تعامل:
   - در برابر پیشنهادهای افشین، تحلیل سئو ارائه بده و راهکار بهینه‌تر پیشنهاد کن.
   - هر زمان به یک تصمیم قطعی برای انتشار یا تسک جدید رسیدید، مشخصاً اعلام کن که کار را به کدام کارشناس ارجاع دادی و آن را در قالب پیش‌نویس برای کارتابل تایید آماده کن.
   - لحنت پرانرژی، نتیجه‌گرا، فارسی روان و سرشار از بینش حرفه‌ای سئو باشد.`,
    },
    members: [
      {
        id: 'agent_seo_writer',
        name: 'نگار پارسا',
        roleFa: 'کارشناس ارشد نویسندگی محتوای سئو',
        departmentId: 'seo',
        isLead: false,
        avatar: '✍️',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'نگارش مقالات تخصصی پیلار و کلاستر با فرمت معنایی HTML، هدینگ‌های بهینه، نگارش جذاب و لینک‌سازی ارگانیک dofollow',
      },
      {
        id: 'agent_seo_designer',
        name: 'کامران دیبا',
        roleFa: 'کارشناس ارشد طراحی بصری و هوش مصنوعی سئو',
        departmentId: 'seo',
        isLead: false,
        avatar: '🎨',
        model: 'Imagen 3 / Canvas',
        status: 'online',
        specialtyFa: 'تولید تصاویر فتورئالیستیک گل و گیاه، بهینه‌سازی نسل جدید WebP (زیر ۱۰۰ کیلوبایت) و آپلود مستقیم در Object Storage گلینو',
      },
      {
        id: 'agent_seo_auditor',
        name: 'کیان راد',
        roleFa: 'ناظر ارشد کیفیت، اسکیما و ممیزی فنی سئو',
        departmentId: 'seo',
        isLead: false,
        avatar: '🔍',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'تزریق اسکیما مارک‌آپ‌های BlogPosting و FAQPage، کنترل چک‌لیست ۱۰ مرحله‌ای کیفیت، کانونیکال و سلامت بودجه خزش',
      },
    ],
  },
  {
    id: 'support',
    name: 'Customer Experience & Care',
    nameFa: 'دپارتمان تجربه مشتری و پشتیبانی',
    descriptionFa: 'پاسخگویی به خریداران، پیگیری سفارشات ارسال فوری گل و حل شکایات در کمترین زمان.',
    icon: 'Headphones',
    color: '#10B981',
    status: 'idle',
    activeTasksCount: 0,
    errorCount: 0,
    leadAgent: {
      id: 'agent_support_lead',
      name: 'هومان مهر',
      roleFa: 'مدیر دپارتمان پشتیبانی',
      departmentId: 'support',
      isLead: true,
      avatar: '👨‍💻',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'هماهنگی جلب رضایت مشتری، مدیریت تیکت‌های مرجوعی و نظرسنجی پس از تحویل',
      systemPrompt: 'تو مدیر دپارتمان پشتیبانی و رضایت مشتری گلینو هستی. اولویت اول تو رساندن به موقع گل‌های تازه و حل استرس خریدار هنگام غافلگیری عزیزشان است.',
    },
    members: [
      {
        id: 'agent_support_bot',
        name: 'آوای گلینو',
        roleFa: 'پشتیبان هوشمند سفارشات ۲۴/۷',
        departmentId: 'support',
        isLead: false,
        avatar: '💬',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'استعلام لحظه‌ای وضعیت لوکیشن پیک، تغییر آدرس تحویل و پاسخگویی به سوالات متداول',
      },
    ],
  },
  {
    id: 'vendors',
    name: 'Vendor Relations & Review',
    nameFa: 'دپارتمان امور فروشندگان و کیفیت گل‌ها',
    descriptionFa: 'ارزیابی کیفیت گل‌فروشی‌های عضو مارکت‌پلیس، تایید قیمت‌گذاری و استانداردسازی محصولات.',
    icon: 'Store',
    color: '#F59E0B',
    status: 'idle',
    activeTasksCount: 0,
    errorCount: 0,
    leadAgent: {
      id: 'agent_vendor_lead',
      name: 'سامان پارسا',
      roleFa: 'مدیر دپارتمان روابط فروشندگان',
      departmentId: 'vendors',
      isLead: true,
      avatar: '🤝',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'پایش امتیاز رضایت از هر گل‌فروشی، تسویه‌حساب‌ها و استانداردسازی عکس محصولات',
      systemPrompt: 'تو مدیر امور فروشندگان گلینو هستی. تمرکزت روی حفظ استاندارد عکاسی محصولات و پایبندی گل‌فروشان به تازه بودن گل‌هاست.',
    },
    members: [
      {
        id: 'agent_vendor_qa',
        name: 'بررسی‌کننده کیفیت',
        roleFa: 'ناظر تایید محصول و عکس',
        departmentId: 'vendors',
        isLead: false,
        avatar: '🔎',
        model: 'Vision Model',
        status: 'online',
        specialtyFa: 'تطبیق عکس ارسالی فروشنده با کیفیت واقعی و جلوگیری از قیمت‌گذاری نامتعارف',
      },
    ],
  },
];

// Real Operational Tasks for Golino SEO
export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-seo-001',
    titleFa: 'ممیزی تکنیکال، پاکسازی دسته‌بندی‌ها و تگ‌های تهی جهت حفاظت از بودجه خزش (AUD-06)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'کیان راد',
    status: 'completed',
    priority: 'urgent',
    createdAt: '۱۴۰۳/۰۸/۱۱',
    dueDateFa: 'انجام شد',
    notesFa: 'حذف دسته‌بندی‌های تستی و تگ‌های تهی؛ تثبیت ۲ دسته‌بندی ستونی buying-guide و flower-care در مجله',
  },
  {
    id: 'task-seo-002',
    titleFa: 'تدوین و انتشار مقاله پیلار جامع خواستگاری و بله‌برون (ID: 7)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'نگار پارسا',
    status: 'completed',
    priority: 'high',
    createdAt: '۱۴۰۳/۰۸/۱۲',
    dueDateFa: 'انجام شد',
    notesFa: 'کلمه کلیدی هدف «خرید دسته گل خواستگاری»، ۳ تصویر WebP آپلود شده و ۴ سوال اسکیما FAQPage',
    imageUrl: 'https://upload.golino.shop/site/08510a01-f011-4520-a134-3b3181e41cbf.webp',
  },
  {
    id: 'task-seo-003',
    titleFa: 'تدوین و انتشار مقاله کلاستر باکس گل (Flower Box) با KD 9 (ID: 8)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'نگار پارسا',
    status: 'completed',
    priority: 'high',
    createdAt: '۱۴۰۳/۰۸/۱۳',
    dueDateFa: 'انجام شد',
    notesFa: 'کلمه طلایی «باکس گل» با ۲۰۰۰ سرچ ماهانه در تهران، فرمت معنایی HTML و ۳ تصویر WebP',
    imageUrl: 'https://upload.golino.shop/site/9d63b974-3978-4096-bc69-817341b4eb8e.webp',
  },
  {
    id: 'task-seo-004',
    titleFa: 'تدوین و انتشار مقاله کلاستر دسته گل طبیعی و سبک‌های مدرن (ID: 9)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'کامران دیبا',
    status: 'completed',
    priority: 'high',
    createdAt: '۱۴۰۳/۰۸/۱۴',
    dueDateFa: 'انجام شد',
    notesFa: 'کلمه هدف «دسته گل» با ۳ تصویر لوکس و اتصال متقابل به دسته‌بندی‌ها و راهنمای باکس گل',
    imageUrl: 'https://upload.golino.shop/site/af7e724a-2e9f-4065-b162-b2e3110c849f.webp',
  },
  {
    id: 'task-seo-005',
    titleFa: 'تدوین و انتشار مقاله پیلار ۱۰ ترفند طلایی نگهداری گل طبیعی در منزل (ID: 10)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'نگار پارسا',
    status: 'completed',
    priority: 'high',
    createdAt: '۱۴۰۳/۰۸/۱۵',
    dueDateFa: 'انجام شد',
    notesFa: 'تکمیل کلاستر دسته نگهداری، ۱۲ بخش فهرست هدینگ‌ها (TOC) و جدول مقایسه نگهداری باکس و دسته گل',
    imageUrl: 'https://upload.golino.shop/site/bf2213ec-573d-47cb-beeb-17394da093d7.webp',
  },
  {
    id: 'task-seo-006',
    titleFa: 'بهینه‌سازی عمیق و ارتقای مقاله سالگرد ازدواج با تصاویر جدید AI و اسکیما (ID: 6)',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    assignedAgentName: 'آرشام سهرابی',
    status: 'in_progress',
    priority: 'high',
    createdAt: '۱۴۰۳/۰۸/۱۵',
    dueDateFa: 'فردا',
    notesFa: 'هدف‌گذاری کلاستر گل سالگرد ازدواج و هدیه همسر در تهران',
    imageUrl: 'https://upload.golino.shop/products/2b434a55-e557-4993-83ab-588c602ddd3e.webp',
  },
];

// Executive Reports for Golino SEO
export const INITIAL_REPORTS: ExecutiveReport[] = [
  {
    id: 'report-seo-001',
    departmentId: 'seo',
    departmentNameFa: 'دپارتمان سئو و رشد اورگانیک',
    periodFa: 'آبان ۱۴۰۳',
    titleFa: 'گزارش ماهانه استقرار ساختار پیلار-کلاستر و ممیزی فنی سئو گلینو',
    summaryFa: 'استقرار زیرساخت‌های بنیادین سئو، ساماندهی دسته‌بندی‌های مجله، تولید و انتشار ۵ مقاله ستونی مرجع با استانداردهای گوگل، و فعال‌سازی جریان اعتبار داخلی میان صفحات تجاری و وبلاگ.',
    accomplishments: [
      'حذف کامل تگ‌های nofollow از لینک‌های داخلی و اصلاح کانونیکال‌ها به دامنه رسمی golino.shop',
      'پاکسازی ۵ پیش‌نویس لورم ایپسوم و حذف تگ‌های تهی جهت حفاظت از بودجه خزش (Crawl Budget)',
      'تولید و انتشار ۴ مقاله پیلار و کلاستر تخصصی با بیش از ۶,۰۰۰ کلمه محتوای معنایی HTML',
      'تولید و آپلود بیش از ۱۲ تصویر فتورئالیستیک فشرده WebP روی Object Storage گلینو',
      'ثبت داده‌های ساختاریافته JSON-LD (اسکیماهای BlogPosting و FAQPage) روی تمام مقالات',
    ],
    blockers: [
      'نیاز به درج کد تایید Google Search Console در تنظیمات سیستم برای رصد زنده ایندکس و کلمات در سرپ',
    ],
    metrics: [
      { label: 'مقالات مرجع فعال', value: '۵ مقاله', change: '+۱۰۰٪' },
      { label: 'کاورهای WebP سئو', value: '۱۲ تصویر', change: '+۱۰۰٪' },
      { label: 'اسکیمای FAQPage', value: '۴ اسکیما', change: '+۴' },
      { label: 'دسته‌بندی‌های ستونی', value: '۲ دسته', change: 'پایدار' },
    ],
    createdAt: '۱۴۰۳/۰۸/۱۵',
  },
];

// Clean slate - No fake escalations
export const INITIAL_ESCALATIONS: EscalationMessage[] = [];

// Initial Executive Briefing for SEO Chat
export const INITIAL_CHAT_HISTORY: Record<string, ChatMessage[]> = {
  seo: [
    {
      id: 'msg-seo-init-1',
      departmentId: 'seo',
      sender: 'lead',
      senderName: 'آرشام سهرابی (مدیر ارشد دپارتمان سئو)',
      text: 'سلام افشین جان! من آرشام سهرابی هستم، مدیر دپارتمان سئوی گلینو. من به همراه تیمم؛ نگار پارسا (نویسنده ارشد محتوا)، کامران دیبا (طراح بصری و هوش مصنوعی) و کیان راد (ناظر کیفی و ممیز فنی سئو)، در این مرکز عملیات در کنارت هستیم. ما ۵ مقاله پیلار و کلاستر اصلی رو با فرمت معنایی HTML، تصاویر WebP و اسکیما منتشر کردیم و زیرساخت تکنیکال کاملاً ممیزی شده. برای گام بعدی آماده‌ایم؛ بفرما بریم سراغ کلاستر گل سالگرد ازدواج یا لندینگ‌های ارسال فوری گل؟',
      timestamp: 'چند لحظه پیش',
      actionsTaken: [
        'بررسی لایو ۵ مقاله منتشر شده در مجله گلینو',
        'تایید سلامت ۱۰۰٪ اسکیماهای FAQPage و BlogPosting',
        'آماده‌سازی تیم برای تسک بعدی کلاستر سالگرد ازدواج',
      ],
    },
  ],
};
