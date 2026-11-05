import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_DEPARTMENTS = [
  {
    id: 'social',
    name: 'Social Media & Brand Marketing',
    nameFa: 'دپارتمان شبکه‌های اجتماعی و برند',
    descriptionFa: 'مدیریت تقویم انتشار، تعامل، سناریونویسی، تولید تصویر و ادمینی اختصاصی ۶ پلتفرم (تلگرام، بله، اینستا، روبیکا، ایکس و لینکدین).',
    icon: 'Share2',
    color: '#EC4899',
    status: 'active',
    leadAgent: {
      id: 'agent_social_lead',
      name: 'سارا راد',
      roleFa: 'مدیر ارشد دپارتمان سوشال مدیا',
      avatar: '👩‍💼',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'استراتژی محتوا، نظارت بر ادمین‌های شبکه‌ها، هماهنگی تقویم مناسبت‌ها و گزارش‌دهی به مدیرعامل',
      systemPrompt: `تو «سارا راد»، مدیر ارشد سوشال مدیا و برند گلینو هستی. با افشین صمیمی، آزادانه، بدون ساختار خشک و مثل یک شریک فکری گفتگو کن.`,
    },
    members: [
      {
        id: 'agent_admin_tg_bale',
        name: 'امیر پیام‌رسان',
        roleFa: 'ادمین ارشد تلگرام و بله',
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
        avatar: '📝',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'نگارش کپشن‌های مسحورکننده، قلاب‌های میلیونی و اسکریپت‌های احساسی برای خرید گل',
      },
      {
        id: 'agent_social_art',
        name: 'روژان دیزاین',
        roleFa: 'طراح ارشد تصویر و هوش مصنوعی',
        avatar: '🎨',
        model: 'Imagen 3 / Canvas',
        status: 'online',
        specialtyFa: 'تولید تصاویر لوکس دسته‌گل با Imagen 3، قالب استوری و ترکیب با لوگوی گلینو',
      },
      {
        id: 'agent_social_publisher',
        name: 'موتور دیسپچر و انتشار خودکار',
        roleFa: 'پایپ‌لاین زمان‌بندی و ارسال API',
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
    leadAgent: {
      id: 'agent_seo_lead',
      name: 'آرشام سهرابی',
      roleFa: 'مدیر ارشد دپارتمان سئو و استراتژی محتوا',
      avatar: '👨‍💼',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'استراتژی کلمات کلیدی، مهندسی کلاسترهای محتوایی، حفاظت از بودجه خزش و بهینه‌سازی نرخ تبدیل ورودی اورگانیک',
      systemPrompt: `تو «آرشام سهرابی»، مدیر ارشد سئو و استراتژی محتوای گلینو هستی. با افشین صمیمی، تحلیل‌گر، آزادانه، بدون ساختار خشک و بدون جواب‌های آماده گفتگو کن.`,
    },
    members: [
      {
        id: 'agent_seo_writer',
        name: 'نگار پارسا',
        roleFa: 'کارشناس ارشد نویسندگی محتوای سئو',
        avatar: '✍️',
        model: 'gemini-3.5-flash-lite',
        status: 'online',
        specialtyFa: 'نگارش مقالات تخصصی پیلار و کلاستر با فرمت معنایی HTML، هدینگ‌های بهینه، نگارش جذاب و لینک‌سازی ارگانیک dofollow',
      },
      {
        id: 'agent_seo_designer',
        name: 'کامران دیبا',
        roleFa: 'کارشناس ارشد طراحی بصری و هوش مصنوعی سئو',
        avatar: '🎨',
        model: 'Imagen 3 / Canvas',
        status: 'online',
        specialtyFa: 'تولید تصاویر فتورئالیستیک گل و گیاه، بهینه‌سازی نسل جدید WebP (زیر ۱۰۰ کیلوبایت) و آپلود مستقیم در Object Storage گلینو',
      },
      {
        id: 'agent_seo_auditor',
        name: 'کیان راد',
        roleFa: 'ناظر ارشد کیفیت، اسکیما و ممیزی فنی سئو',
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
    leadAgent: {
      id: 'agent_support_lead',
      name: 'هومان مهر',
      roleFa: 'مدیر دپارتمان پشتیبانی',
      avatar: '👨‍💻',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'هماهنگی جلب رضایت مشتری، مدیریت تیکت‌های مرجوعی و نظرسنجی پس از تحویل',
      systemPrompt: `تو «هومان مهر»، مدیر دپارتمان پشتیبانی و تجربه مشتری گلینو هستی. با افشین صمیمی، روراست و بدون فرمول‌های اداری صحبت کن.`,
    },
    members: [
      {
        id: 'agent_support_bot',
        name: 'آوای گلینو',
        roleFa: 'پشتیبان هوشمند سفارشات ۲۴/۷',
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
    leadAgent: {
      id: 'agent_vendor_lead',
      name: 'سامان پارسا',
      roleFa: 'مدیر دپارتمان روابط فروشندگان',
      avatar: '🤝',
      model: 'gemini-3.5-flash-lite',
      status: 'online',
      specialtyFa: 'پایش امتیاز رضایت از هر گل‌فروشی، تسویه‌حساب‌ها و استانداردسازی عکس محصولات',
      systemPrompt: `تو «سامان پارسا»، مدیر امور فروشندگان و کیفیت گلینو هستی. با افشین خودمانی، صریح و بدون تعارف صحبت کن.`,
    },
    members: [
      {
        id: 'agent_vendor_qa',
        name: 'بررسی‌کننده کیفیت',
        roleFa: 'ناظر تایید محصول و عکس',
        avatar: '🔎',
        model: 'Vision Model',
        status: 'online',
        specialtyFa: 'تطبیق عکس ارسالی فروشنده با کیفیت واقعی و جلوگیری از قیمت‌گذاری نامتعارف',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting Golino HQ Database Seed...');

  for (const dept of SEED_DEPARTMENTS) {
    console.log(`Seeding Department: ${dept.nameFa}...`);

    await prisma.department.upsert({
      where: { id: dept.id },
      update: {
        name: dept.name,
        nameFa: dept.nameFa,
        descriptionFa: dept.descriptionFa,
        icon: dept.icon,
        color: dept.color,
        status: dept.status,
      },
      create: {
        id: dept.id,
        name: dept.name,
        nameFa: dept.nameFa,
        descriptionFa: dept.descriptionFa,
        icon: dept.icon,
        color: dept.color,
        status: dept.status,
        activeTasksCount: 0,
        errorCount: 0,
      },
    });

    // Seed Lead Agent
    const lead = dept.leadAgent;
    await prisma.agent.upsert({
      where: { id: lead.id },
      update: {
        name: lead.name,
        roleFa: lead.roleFa,
        departmentId: dept.id,
        isLead: true,
        avatar: lead.avatar,
        model: lead.model,
        status: lead.status,
        specialtyFa: lead.specialtyFa,
        systemPrompt: lead.systemPrompt,
      },
      create: {
        id: lead.id,
        name: lead.name,
        roleFa: lead.roleFa,
        departmentId: dept.id,
        isLead: true,
        avatar: lead.avatar,
        model: lead.model,
        status: lead.status,
        specialtyFa: lead.specialtyFa,
        systemPrompt: lead.systemPrompt,
      },
    });

    // Seed Team Members
    for (const member of dept.members) {
      await prisma.agent.upsert({
        where: { id: member.id },
        update: {
          name: member.name,
          roleFa: member.roleFa,
          departmentId: dept.id,
          isLead: false,
          avatar: member.avatar,
          model: member.model,
          status: member.status,
          specialtyFa: member.specialtyFa,
          assignedChannelsFa: (member as any).assignedChannelsFa || null,
        },
        create: {
          id: member.id,
          name: member.name,
          roleFa: member.roleFa,
          departmentId: dept.id,
          isLead: false,
          avatar: member.avatar,
          model: member.model,
          status: member.status,
          specialtyFa: member.specialtyFa,
          assignedChannelsFa: (member as any).assignedChannelsFa || null,
        },
      });
    }
  }

  console.log('✅ Golino HQ Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
