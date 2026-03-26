export interface TikTokAccount {
  accountName: string;
  fullName: string;
  tiktokLink: string;
  isRegistered: boolean;
  mcnStatus: string;
  approvalStatus: string;
}

export const mockData: TikTokAccount[] = [
  {
    accountName: "hangsandeal",
    fullName: "Phạm Thị Thu Hằng",
    tiktokLink: "https://www.tiktok.com/@hangsandeal",
    isRegistered: true,
    mcnStatus: "LINK REQUESTED",
    approvalStatus: "Đang chờ duyệt"
  },
  {
    accountName: "ninanguyen.com.vn",
    fullName: "Nina Nguyễn",
    tiktokLink: "https://www.tiktok.com/@ninanguyen.com.vn",
    isRegistered: true,
    mcnStatus: "CONNECTED",
    approvalStatus: "Đã duyệt"
  },
  {
    accountName: "creator123",
    fullName: "Nguyễn Văn A",
    tiktokLink: "https://www.tiktok.com/@creator123",
    isRegistered: false,
    mcnStatus: "NOT LINKED",
    approvalStatus: "Chưa đăng ký"
  }
];
