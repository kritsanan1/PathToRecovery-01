import { storage } from "./storage";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Seed sample milestones for new users
    const sampleMilestones = [
      {
        title: "7 วันแรกของการฟื้นฟู",
        description: "ครบรอบสัปดาห์แรกของการดูแลตนเองและความแข็งแกร่ง",
        targetDays: 7,
        achieved: false,
      },
      {
        title: "30 วันแห่งความมุ่งมั่น",
        description: "ครบรอบ 1 เดือนของการฟื้นฟูและสร้างนิสัยใหม่",
        targetDays: 30,
        achieved: false,
      },
      {
        title: "90 วันแกร่งกล้า",
        description: "ผ่านพ้นช่วง 3 เดือนที่ท้าทายที่สุดของการฟื้นฟู",
        targetDays: 90,
        achieved: false,
      },
      {
        title: "ครึ่งปีแห่งความสำเร็จ",
        description: "บรรลุครบ 6 เดือนของการเปลี่ยนแปลงชีวิต",
        targetDays: 180,
        achieved: false,
      },
      {
        title: "1 ปีแห่งการเกิดใหม่",
        description: "ครบรอบ 1 ปีของชีวิตใหม่ที่แกร่งกล้าและมีความสุข",
        targetDays: 365,
        achieved: false,
      }
    ];

    // Seed educational resources
    const sampleResources = [
      {
        title: "เข้าใจการติดสาร: สาเหตุและผลกระทบ",
        description: "ความรู้พื้นฐานเกี่ยวกับการติดสารและผลกระทบต่อสมองและร่างกาย",
        content: "การติดสารเป็นโรคที่สามารถรักษาได้ ความเข้าใจเกี่ยวกับกลไกการทำงานของสมองและการติดสารจะช่วยให้เราเข้าใจว่าทำไมการหยุดใช้สารจึงยาก และวิธีการฟื้นฟูที่มีประสิทธิภาพคืออะไร...",
        type: "article",
        category: "mental_health",
        estimatedTime: 15,
        imageUrl: "/api/placeholder/brain-science",
        isPublished: true,
      },
      {
        title: "เทคนิคการจัดการความเครียดและความปรารถนา",
        description: "วิธีปฏิบัติที่พิสูจน์แล้วในการจัดการกับความปรารถนาในการใช้สาร",
        content: "เทคนิค HALT (Hungry, Angry, Lonely, Tired), การหายใจเข้าลึก, การออกกำลังกาย, และการสร้างสัมพันธ์ที่ดี...",
        type: "article",
        category: "strategy",
        estimatedTime: 20,
        imageUrl: "/api/placeholder/stress-management",
        isPublished: true,
      },
      {
        title: "การสร้างแผนการฟื้นฟูส่วนบุคคล",
        description: "คู่มือการสร้างแผนการฟื้นฟูที่เหมาะสมกับตัวคุณ",
        content: "การฟื้นฟูที่ประสบความสำเร็จต้องเป็นแผนที่ปรับแต่งตามบุคคล เริ่มจากการประเมินตนเอง กำหนดเป้าหมาย และสร้างระบบสนับสนุน...",
        type: "article",
        category: "strategy",
        estimatedTime: 25,
        imageUrl: "/api/placeholder/recovery-plan",
        isPublished: true,
      },
      {
        title: "การสร้างระบบสนับสนุนและชุมชน",
        description: "ความสำคัญของการมีระบบสนับสนุนที่แข็งแกร่ง",
        content: "การฟื้นฟูไม่ใช่เส้นทางที่ต้องเดินคนเดียว ระบบสนับสนุนที่ดีประกอบด้วยครอบครัว เพื่อน กลุ่มสนับสนุน และผู้เชี่ยวชาญ...",
        type: "article",
        category: "support",
        estimatedTime: 18,
        imageUrl: "/api/placeholder/support-system",
        isPublished: true,
      },
      {
        title: "การออกกำลังกายสำหรับการฟื้นฟู",
        description: "แผนการออกกำลังกายที่เหมาะสมสำหรับช่วงการฟื้นฟู",
        content: "การออกกำลังกายช่วยฟื้นฟูสมองและร่างกาย ลดความเครียด และสร้างความรู้สึกดีธรรมชาติ...",
        type: "video",
        category: "strategy",
        estimatedTime: 30,
        videoUrl: "/api/placeholder/exercise-video",
        isPublished: true,
      }
    ];

    // Seed emergency contacts
    const emergencyContacts = [
      {
        name: "สายด่วนสุขภาพจิต กรมสุขภาพจิต",
        phoneNumber: "1413",
        description: "บริการให้คำปรึกษาด้านสุขภาพจิตและการติดสาร",
        isAvailable24h: true,
        category: "hotline",
        location: "ทั่วประเทศ",
      },
      {
        name: "ศูนย์ช่วยเหลือคนติดสาร สำนักงานคณะกรรมการป้องกันและปราบปรามยาเสพติดแห่งชาติ",
        phoneNumber: "1165",
        description: "ให้คำปรึกษาและช่วยเหลือผู้ติดสารและครอบครัว",
        isAvailable24h: true,
        category: "hotline",
        location: "ทั่วประเทศ",
      },
      {
        name: "สายด่วนโรงพยาบาลศรีธัญญา",
        phoneNumber: "02-374-8200",
        description: "โรงพยาบาลเอกชนที่มีแผนกสุขภาพจิตและการติดสาร",
        isAvailable24h: true,
        category: "hospital",
        location: "กรุงเทพมหานคร",
      },
      {
        name: "มูลนิธิสายใจ",
        phoneNumber: "02-713-6793",
        description: "ให้คำปรึกษาทางโทรศัพท์สำหรับปัญหาสุขภาพจิต",
        isAvailable24h: false,
        category: "counseling",
        location: "กรุงเทพมหานคร",
      }
    ];

    // Seed rehabilitation centers
    const rehabCenters = [
      {
        name: "โรงพยาบาลกรุงเทพ ศูนย์การติดสาร",
        address: "2 ซอยสุทธิสารวนิช ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310",
        phoneNumber: "02-310-3000",
        latitude: "13.7563",
        longitude: "100.5018",
        openingHours: "24 ชั่วโมง",
        services: "รักษาผู้ป่วยใน, ผู้ป่วยนอก, โปรแกรมฟื้นฟู, กรุ๊ปเธอราปี",
        isOpen24h: true,
      },
      {
        name: "โรงพยาบาลศิริราช ภาควิชาจิตเวชศาสตร์",
        address: "2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700",
        phoneNumber: "02-419-7000",
        latitude: "13.7580",
        longitude: "100.4858",
        openingHours: "จันทร์-ศุกร์ 8:00-16:00",
        services: "ผู้ป่วยนอก, การประเมิน, แผนการรักษา, ยา",
        isOpen24h: false,
      },
      {
        name: "สถาบันป้องกันเวชศาสตร์เสพติด",
        address: "88/6 หมู่ที่ 4 ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120",
        phoneNumber: "02-965-8600",
        latitude: "14.0832",
        longitude: "100.6518",
        openingHours: "จันทร์-ศุกร์ 8:30-16:30",
        services: "รักษาผู้ป่วยใน, ผู้ป่วยนอก, โปรแกรมฟื้นฟู, ฝึกอบรม",
        isOpen24h: false,
      },
      {
        name: "โรงพยาบาลจุฬาลงกรณ์ แผนกจิตเวช",
        address: "1873 ถนนพระรามที่ 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330",
        phoneNumber: "02-256-4000",
        latitude: "13.7317",
        longitude: "100.5289",
        openingHours: "จันทร์-ศุกร์ 8:00-16:00",
        services: "ผู้ป่วยนอก, การประเมิน, การรักษาด้วยยา, จิตบำบัด",
        isOpen24h: false,
      }
    ];

    // Seed community posts
    const samplePosts = [
      {
        content: "วันนี้เป็นวันที่ 30 ของการฟื้นฟู รู้สึกดีขึ้นมากและมีพลังในการทำสิ่งต่างๆ ขอบคุณทุกคนที่ให้กำลังใจ 💪",
        isAnonymous: false,
      },
      {
        content: "อยากแบ่งปันเทคนิคการหายใจที่ช่วยผมผ่านช่วงเวลายากๆ ได้ หายใจเข้า 4 วินาที กลั้น 4 วินาที หายใจออก 4 วินาที ช่วยให้ใจเซ็งลงได้จริงๆ",
        isAnonymous: true,
      },
      {
        content: "เมื่อไหร่จะเลิกคิดว่าตัวเองแย่ ตอนนี้กำลังดิ้นรนกับความรู้สึกผิดที่ทำร้ายคนรอบข้างในอดีต",
        isAnonymous: true,
      },
      {
        content: "แนะนำหนังสือดีๆ เรื่อง 'พลังแห่งปัจจุบัน' ช่วยให้เข้าใจตัวเองมากขึ้นและรู้วิธีอยู่กับปัจจุบัน",
        isAnonymous: false,
      },
      {
        content: "วันนี้มีอาการอยากใช้สารมาก แต่ลองเปิดเพลงดังๆ กับออกกำลังกาย 20 นาที อาการดีขึ้นเยอะเลย ขอบคุณที่มีชุมชนนี้",
        isAnonymous: true,
      }
    ];

    // Insert all sample data
    for (const resource of sampleResources) {
      try {
        await storage.createResource(resource);
      } catch (error) {
        console.log("Resource already exists or insert failed:", error);
      }
    }

    for (const contact of emergencyContacts) {
      try {
        await storage.createEmergencyContact(contact);
      } catch (error) {
        console.log("Emergency contact already exists or insert failed:", error);
      }
    }

    for (const center of rehabCenters) {
      try {
        await storage.createRehabCenter(center);
      } catch (error) {
        console.log("Rehab center already exists or insert failed:", error);
      }
    }

    // Seed discussion channels
    const sampleChannels = [
      {
        name: "การสนับสนุนทั่วไป",
        description: "พื้นที่สำหรับแบ่งปันความรู้สึกและรับการสนับสนุนจากชุมชน",
        category: "support",
        memberCount: 45,
        moderatorId: "system"
      },
      {
        name: "เรื่องราวการฟื้นฟู",
        description: "แบ่งปันประสบการณ์และเรื่องราวแรงบันดาลใจ",
        category: "recovery_stories", 
        memberCount: 32,
        moderatorId: "system"
      },
      {
        name: "เช็คอินรายวัน",
        description: "ติดตามความรู้สึกและความก้าวหน้าประจำวัน",
        category: "daily_check_in",
        memberCount: 67,
        moderatorId: "system"
      },
      {
        name: "แหล่งข้อมูลและเทคนิค",
        description: "แบ่งปันทรัพยากรและเทคนิคการฟื้นฟูที่มีประสิทธิภาพ",
        category: "resources",
        memberCount: 28,
        moderatorId: "system"
      }
    ];

    // Seed doctors
    const sampleDoctors = [
      {
        specialization: "addiction_medicine",
        bio: "แพทย์เชี่ยวชาญด้านการเสพติดพร้อมประสบการณ์ 15 ปี ในการช่วยเหลือผู้ป่วยฟื้นฟู",
        consultationRate: 2500,
        isAvailable: true,
        rating: 4.8,
        totalConsultations: 234,
        languages: ["thai", "english"]
      },
      {
        specialization: "psychiatry",
        bio: "จิตแพทย์ผู้เชี่ยวชาญด้านสุขภาพจิตและการฟื้นฟูจากการเสพติด",
        consultationRate: 3000,
        isAvailable: true,
        rating: 4.9,
        totalConsultations: 189,
        languages: ["thai"]
      },
      {
        specialization: "counseling",
        bio: "นักจิตวิทยาให้คำปรึกษาที่มีประสบการณ์ในการช่วยเหลือครอบครัวและผู้ป่วย",
        consultationRate: 1800,
        isAvailable: true,
        rating: 4.7,
        totalConsultations: 156,
        languages: ["thai", "english"]
      }
    ];

    // Seed content categories
    const sampleCategories = [
      {
        name: "สุขภาพจิต",
        description: "ความรู้เกี่ยวกับสุขภาพจิตและการดูแลตนเอง",
        color: "#4F46E5",
        orderIndex: 1
      },
      {
        name: "เทคนิคการฟื้นฟู", 
        description: "วิธีการและเทคนิคการฟื้นฟูที่มีประสิทธิภาพ",
        color: "#059669",
        orderIndex: 2
      },
      {
        name: "การสนับสนุนครอบครัว",
        description: "คำแนะนำสำหรับครอบครัวและคนใกล้ชิด",
        color: "#DC2626",
        orderIndex: 3
      }
    ];

    for (const channel of sampleChannels) {
      try {
        await storage.createDiscussionChannel(channel);
      } catch (error) {
        console.log("Discussion channel already exists or insert failed:", error);
      }
    }

    for (const doctor of sampleDoctors) {
      try {
        await storage.createDoctor(doctor);
      } catch (error) {
        console.log("Doctor already exists or insert failed:", error);
      }
    }

    for (const category of sampleCategories) {
      try {
        await storage.createContentCategory(category);
      } catch (error) {
        console.log("Content category already exists or insert failed:", error);
      }
    }

    console.log("Database seeded successfully with advanced features!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}