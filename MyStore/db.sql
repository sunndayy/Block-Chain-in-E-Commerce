-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 26, 2019 at 03:26 AM
-- Server version: 5.7.22
-- PHP Version: 7.0.30-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fROIiKFSmc`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `price` float DEFAULT NULL,
  `views` int(11) DEFAULT NULL,
  `sells` int(11) DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `origin` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `publishing_company` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `name`, `price`, `views`, `sells`, `description`, `origin`, `type`, `publishing_company`, `amount`, `image`, `date`) VALUES
(1, 'Thám tử lừng danh Conan tập 93', 17000, 1220, 238, 'Tập 93 của bộ truyện tranh nổi tiếng Thám tử lừng danh Conan', 'Nhật Bản', 1, 1, 310, '/images/KimDong_TruyenTranh/Tham tu lung danh Conan - 17 000.jpg', '2018-05-10 20:27:09'),
(2, 'Shin cậu bé bút chì tập 5', 21000, 1540, 315, 'Truyện tranh về cậu bé bút chì Shin', 'Nhật Bản', 1, 1, 220, '/images/KimDong_TruyenTranh/Shin cau be but chi - tap 5 - 11 000.jpg', '2018-05-10 20:27:46'),
(3, 'Lý thuyết laze sợi quang', 126000, 7410, 230, 'Khái niệm cơ bản về laze sợi quang', 'Việt Nam', 5, 5, 50, '/images/NXBKHKT_SachKHKT/Ly thuyet laze soi quang - 126 000.jpg', '2018-05-10 20:27:59'),
(4, 'Chàng trai nhà bên', 77000, 4561, 4004, 'Câu chuyện tình lãng mạn và hài hước. Trong đó, sự đan xen giữa tình bạn, tình yêu và biết bao lộn xộn nơi công sở được thể hiện qua những bức email giữa các nhân vật hứa hẹn sẽ mang đến cho độc giả không ít những điều thú vị...', 'Hoa Kỳ', 2, 2, 60, '/images/PhuongNam_SachNgonTinh/Chang trai nha ben - 77 000.jpg', '2018-05-10 20:28:37'),
(5, 'Bạn chỉ sống có một lần', 43000, 2500, 1732, 'Quyển sách tập hợp những câu chuyện, những câu nói hay về cuộc sống', 'Việt Nam', 3, 3, 70, '/images/NXBTre_KyNangSong/Ban chi song co 1 lan - 43 000.jpg', '2018-05-10 20:28:48'),
(6, 'Bộ đề thi trắc nghiệm tiếng Anh', 11000, 4136, 3400, 'Cung cấp đề thi mẫu trắc nghiệm môn tiếng Anh', 'Việt Nam', 4, 4, 80, '/images/KhangVietBook_SachThamKhao/Bo de thi trac nghiem Tieng Anh - 11 000.jpg', '2018-05-10 20:28:59'),
(7, 'Công nghệ Enzym', 126000, 8153, 1223, 'Cung cấp những tri thức về công nghệ Enzym', 'Việt Nam', 5, 5, 79, '/images/NXBKHKT_SachKHKT/Cong nghe Enzym - 126 000.jpg', '2018-05-10 20:29:08'),
(8, 'One piece tập 83', 15600, 1130, 137, 'Tập 83 bộ truyện tranh Đảo hải tặc - One piece', 'Nhật Bản', 1, 1, 120, '/images/KimDong_TruyenTranh/One piece tap 83 - 15 600.jpg', '2018-05-19 19:51:08'),
(9, 'Yu gi oh - Vua trò chơi tập 34', 11000, 460, 65, 'Tập 38 bộ truyện tranh Yu gi oh', 'Nhật Bản', 1, 1, 550, '/images/KimDong_TruyenTranh/Yu gi oh - Vua tro choi - 11 000.jpg', '2018-05-19 19:54:56'),
(10, 'Tớ là mèo Pusheen', 42000, 1230, 160, 'Bộ truyện tranh hài hước về chú mèo Pusheen', 'Hoa kỳ', 1, 1, 77, '/images/KimDong_TruyenTranh/To la meo pusheen - 42 000.jpg', '2018-05-19 19:56:44'),
(11, 'Nàng công chúa nhìn xa', 11000, 980, 109, 'Câu chuyện kể về nàng công chúa nọ nhìn xa tinh tường, kén phò mã có tài ẩn nấp', 'Việt Nam', 1, 1, 45, '/images/KimDong_TruyenTranh/Nang cong chua nhin xa - 11 000.jpg', '2018-05-19 19:58:39'),
(12, 'Mất ký ức', 66000, 4750, 3999, 'Tiểu thuyết Mất Ký Ức xoay quanh 4 nhân vật chính là Jona (người kể chuyện), QT (một ca sĩ nổi danh), Kun (bạn trai thân của Jona) và Run (người đàn ông bí ẩn trong bộ đồ nâu)', 'Việt Nam', 2, 2, 16, '/images/PhuongNam_SachNgonTinh/Mat ky uc - 66 000.jpg', '2018-05-19 22:13:34'),
(13, 'Mối tình caro trắng đen', 41300, 4512, 3814, 'Nắng thu dọi qua cành cây trong sân, in bóng loang lổ lên người carô trắng đen. Bàn tay búp măng lượn xuống, chốc lát đã làm xong chiếc khuy áo cưới xinh xinh', 'Việt Nam', 2, 2, 25, '/images/PhuongNam_SachNgonTinh/Moi tinh caro trang den - 41 300.jpg', '2018-05-19 22:15:27'),
(14, 'Ngoại tình với cô đơn', 45000, 4666, 3800, 'Có thể nào, phút chốc ấy đã yêu một người? Có thể nào, đã yêu Vũ chỉ sau một đêm?', 'Việt Nam', 2, 2, 452, '/images/PhuongNam_SachNgonTinh/Ngoai tinh voi co don 45 000.jpg', '2018-05-19 22:17:40'),
(15, 'Ngôi nhà vui vẻ', 32000, 4085, 3756, 'Tác phẩm Ngôi nhà vui vẻ mang đến cho người đọc một câu chuyện mới, được lấy cảm hứng từ chính cuộc đời của mình qua nhân vật cô gái Wi Nyeong mười tám tuổi', 'Hàn Quốc', 2, 2, 37, '/images/PhuongNam_SachNgonTinh/Ngoi nha vui ve - 32 000.jpg', '2018-05-19 22:20:40'),
(16, 'Ngôi sao cô đơn', 82000, 5617, 3604, 'Là một tiểu thuyết hình sự nhưng đẫm chất tâm lý, bởi nó muốn nói lên nguyên nhân của sự cô đơn chứ không phải nói lên nguyên nhân của một cái chết', 'Việt Nam', 2, 2, 35, '/images/PhuongNam_SachNgonTinh/Ngoi sao co don - 82 000.jpg', '2018-05-19 22:22:55'),
(17, 'Lá cờ thêu 6 chữ vàng', 105000, 1654, 323, 'Câu chuyện về người anh hùng trẻ tuổi Trần Quốc Toản', 'Việt Nam', 1, 1, 55, '/images/KimDong_TruyenTranh/La co theu 6 chu vang - 105 000.jpg', '2018-06-09 01:15:32'),
(18, 'Tuyển tập Doreamon', 117000, 2300, 123, 'Câu chuyện về chú mèo máy vượt thời gian Doreamon và chàng trai hậu đậu Nobita', 'Nhật Bản', 1, 1, 620, '/images/KimDong_TruyenTranh/Doreamon - 117 000.jpg', '2018-06-09 01:17:49'),
(19, 'Đầu gấu và 4 mắt tập 2', 14400, 456, 82, 'Chuyện về cậu lớp trưởng Adachi Hana chăm chỉ, nhiệt huyết nhưng học dốt và giỏi huýnh lộn', 'Nhật Bản', 1, 1, 97, '/images/KimDong_TruyenTranh/Dau gau va 4 mat - 14 400.jpg', '2018-06-09 01:20:08'),
(20, 'Chuyện ông Gióng', 20000, 501, 21, 'Truyền thuyết về Thánh Gióng cưỡi ngựa đánh giặc', 'Việt Nam', 1, 1, 54, '/images/KimDong_TruyenTranh/Chuyen ong giong - 20 000.jpg', '2018-06-09 01:21:23'),
(21, 'Quay cuồng vì yêu', 33000, 5511, 3598, 'Trong một thị trấn nhỏ, có hai người đàn ông đẹp trai và hoà hoa, làm tất cả đám phụ nữ “quay cuồng vì yêu” ...', 'Anh', 2, 2, 95, '/images/PhuongNam_SachNgonTinh/Quay cuong vi yeu - 33 000.jpg', '2018-06-09 01:25:39'),
(22, 'Tất cả em cần là tình yêu', 40600, 4855, 3520, 'Hạ Hương chẳng hề là kiểu phụ nữ độc nhất, kì lạ, hiếm thấy, nghìn người có một, cô là một cô gái đô thị điển hình: xinh đẹp, tài năng, học thức, nhạy cảm thiên bẩm, khát yêu đến mức tôn thờ ...', 'Việt Nam', 2, 2, 110, '/images/PhuongNam_SachNgonTinh/Tat ca em can la tinh yeu - 40 600.jpg', '2018-06-09 01:27:09'),
(23, 'Thức dậy anh vẫn là mơ', 55300, 4663, 3478, 'Thức dậy, anh vẫn là mơ - những cơn mơ dù buồn vẫn lấp lánh hạnh phúc và tràn đầy niềm tin vắt nối sang đời thực - đã tạo nên một Jun Phạm trưởng thành hơn, bản lĩnh hơn với từng trang viết ...', 'Việt Nam', 2, 2, 36, '/images/PhuongNam_SachNgonTinh/Thuc day anh van la mo - 55 300.jpg', '2018-06-09 01:28:58'),
(24, 'Tình yêu không mật mã', 77000, 4413, 3448, 'Tô Cẩm trong Tình yêu không mật mã của tác giả Kinh Hồng là một cô gái trong sáng, dịu dàng, cô đang cùng người yêu có những dự định xây đắp cho hạnh phúc tương lai ...', 'Trung Quốc', 2, 2, 59, '/images/PhuongNam_SachNgonTinh/Tinh yeu khong mat ma - 77 000.jpg', '2018-06-09 01:30:09'),
(25, 'Cà phê cùng Tony', 62000, 5600, 2400, 'Tập hợp những câu chuyện về kinh nghiệm sống của tác giả Tony', 'Việt Nam', 3, 3, 77, '/images/NXBTre_KyNangSong/Ca phe cung Tony - 62 000.jpg', '2018-06-09 01:32:26'),
(26, 'Dạy con làm giàu tập 3', 133000, 3125, 1236, 'Những bài học về làm giàu', 'Hoa Kỳ', 3, 3, 97, '/images/NXBTre_KyNangSong/Day con lam giau - 133 000.jpg', '2018-06-09 01:33:43'),
(27, 'Gieo mầm tính cách - Thật thà', 28000, 4123, 1157, 'Cuốn sách nói về những bài học về đức tính thật thà', 'Việt Nam', 3, 3, 85, '/images/NXBTre_KyNangSong/Gieo mam tinh cach - That tha - 28 000.jpg', '2018-06-09 01:34:49'),
(28, 'Thế giới phẳng', 194000, 2314, 901, 'Những thông tin bổ ích về thế giới trong quá trình hội nhập ...', 'Hoa Kỳ', 3, 3, 73, '/images/NXBTre_KyNangSong/The gioi phang - 194 000.jpg', '2018-06-09 01:35:57'),
(29, 'Thuật xử thế của người xưa', 28000, 5123, 4351, 'Thuật xử thế của người xưa thông qua những điển tích Trung Hoa để rút ra những bài học uyên thâm và đầy ngụ ý', 'Việt Nam', 3, 3, 68, '/images/NXBTre_KyNangSong/Thuat xu the cua nguoi xua - 28 000.jpg', '2018-06-09 01:37:42'),
(30, 'Tiền không mua được gì?', 133000, 6730, 4215, 'Trong cuốn sách này, Michael J. Sandel đặt ra một trong những câu hỏi về đạo đức quan trọng nhất của thời đại chúng ta', 'Hoa Kỳ', 3, 3, 192, '/images/NXBTre_KyNangSong/Tien khong mua duoc gi - 133 000.jpg', '2018-06-09 01:38:52'),
(31, 'Tony buổi sáng - Trên đường băng', 60000, 5115, 4099, 'Câu chuyện về những kinh nghiệm, bài học sống của tác giả', 'Việt Nam', 3, 3, 204, '/images/NXBTre_KyNangSong/Tony Buoi Sang - Tren Duong Bang - 60 000.jpg', '2018-06-09 01:39:57'),
(32, 'Tư duy đúng cách - Tư duy logic', 33000, 4878, 4034, 'Cuốn sách trình bày những kỹ năng tư duy logic', 'Hoa Kỳ', 3, 3, 308, '/images/NXBTre_KyNangSong/Tu duy dung cach - Tu duy logic - 33 000.jpg', '2018-06-09 01:41:06'),
(33, 'Bức phá điểm thi THPT quốc gia môn Toán - Tập 1', 51800, 9768, 1169, 'Sách luyện thi THPT quốc gia môn Toán', 'Việt Nam', 4, 4, 66, '/images/KhangVietBook_SachThamKhao/Buc pha diem thi THPT Quoc gia mon toan tap 1 - 51 800.jpg', '2018-06-09 01:43:11'),
(34, 'Cẩm nang giải nhanh bài toán Vật lý', 75000, 9657, 1102, 'Cung cấp kỹ năng giải nhanh bài toán trắc nghiệm Vật lý', 'Việt Nam', 4, 4, 78, '/images/KhangVietBook_SachThamKhao/Cam nang giai nhanh bai toan vat ly - 75 000.jpg', '2018-06-09 01:44:15'),
(35, 'Cẩm nang luyện thi Đại học - Hình học - quyển 3', 130000, 9600, 1101, 'Cẩm nang luyện thi hình học đại học quyển 3', 'Việt Nam', 4, 4, 79, '/images/KhangVietBook_SachThamKhao/Cam nang luyen thi dai hoc - hinh hoc- quyen 3 - 130 000.jpg', '2018-06-09 01:45:11'),
(36, 'Công phá đề thi THPT Quốc gia Vật lý', 86000, 9454, 203, 'Cẩm nang ôn thi Vật lý', 'Việt Nam', 4, 4, 784, '/images/KhangVietBook_SachThamKhao/Cong pha de thi THPT Quoc gia Vat ly - 86 000.jpg', '2018-06-09 01:46:11'),
(37, 'Giải chi tiết bộ đề thi môn Hóa học', 80000, 9449, 103, 'Sách tham khảo môn Hóa học', 'Việt Nam', 4, 4, 45, '/images/KhangVietBook_SachThamKhao/Giai chi tiet bo de thi mon Hoa - 80 000.jpg', '2018-06-09 01:47:02'),
(38, 'Luyện siêu trí nhớ từ vựng', 74500, 9132, 505, 'Giúp luyện trí nhớ Từ vựng tiếng anh', 'Việt Nam', 4, 4, 56, '/images/KhangVietBook_SachThamKhao/Luyen sieu tri nho tu vung - 74 500.jpg', '2018-06-09 01:47:48'),
(39, 'Ngân hàng câu hỏi trắc nghiệm tiếng Anh', 140000, 9909, 1103, 'Cung cấp câu hỏi trắc nghiệm mẫu môn tiếng Anh', 'Việt Nam', 4, 4, 22, '/images/KhangVietBook_SachThamKhao/Ngan hang cau hoi trac nghiem tieng Anh - 140 000.jpg', '2018-06-09 01:48:59'),
(40, 'Ôn tập luyện thi trắc nghiệm THPT Quốc gia', 39000, 8874, 1106, 'Luyện thi trắc nghiệm Toán - Lý - Hóa - Sinh', 'Việt Nam', 4, 4, 35, '/images/KhangVietBook_SachThamKhao/On tap luyen thi trac nghiem THPT Quoc gia - 39 500.jpg', '2018-06-09 01:49:56'),
(41, 'Sổ tay toán lý hóa cấp 3', 53000, 8862, 1117, 'Cung cấp kiến thức ngắn gọn về các môn toán - lý - hóa', 'Việt Nam', 4, 4, 49, '/images/KhangVietBook_SachThamKhao/So tay toan ly hoa cap 3 - 53 000.jpg', '2018-06-09 01:50:54'),
(42, 'Công nghệ mỏ dầu', 150000, 8069, 207, 'Khái niệm cơ bản về công nghệ mỏ dầu', 'Việt Nam', 5, 5, 221, '/images/NXBKHKT_SachKHKT/Cong nghe mo dau - 150 000.jpg', '2018-06-09 01:54:00'),
(43, 'Kết cấu nhà bê tông cốt thép', 98000, 7557, 1369, 'Khái niệm cơ bản về kết cấu nhà bê tông cốt thép', 'Việt Nam', 5, 5, 60, '/images/NXBKHKT_SachKHKT/Ket cau nha be tong cot thep - 98 000.jpg', '2018-06-09 01:54:58'),
(44, 'Lý thuyết mạch', 59000, 6569, 1271, 'Lý thuyết cơ bản về mạch số', 'Việt Nam', 5, 5, 125, '/images/NXBKHKT_SachKHKT/Ly thuyet mach - 59 000.jpg', '2018-06-09 01:56:14'),
(45, 'Nhiên liệu sạch', 168000, 6092, 1158, 'Ứng dụng của nhiên liệu sạch', 'Việt Nam', 5, 5, 340, '/images/NXBKHKT_SachKHKT/Nhien lieu sach - 168 000.jpg', '2018-06-09 01:57:02');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fullname` varchar(255) CHARACTER SET utf8 NOT NULL,
  `address` varchar(255) CHARACTER SET utf8 NOT NULL,
  `phone` varchar(11) CHARACTER SET utf8 NOT NULL,
  `status` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `payStatus` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sum_price` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `publishing_company`
--

CREATE TABLE `publishing_company` (
  `id` int(11) NOT NULL,
  `nameCompany` varchar(255) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `publishing_company`
--

INSERT INTO `publishing_company` (`id`, `nameCompany`) VALUES
(1, 'NXB Kim Đồng'),
(2, 'Phương Nam'),
(3, 'NXB Trẻ'),
(4, 'Khang Việt Book'),
(5, 'NXB Khoa học kỹ thuật'),
(6, 'Nhà sách Sao Mai'),
(7, 'Đinh Tỵ'),
(8, 'Văn Lang'),
(9, 'Tân Việt'),
(10, 'First New'),
(11, 'AlphaBooks'),
(12, 'Nhà sách Minh Trí'),
(13, 'Nhã Nam'),
(14, 'Nhà sách Thị Nghè'),
(15, 'Nhân Trí Việt'),
(16, 'Huy Hoang BookStore'),
(17, 'Công ty Cổ phần Văn Hóa Nhân Văn'),
(18, 'Công ty TNHH TM - DV Chính Thông'),
(19, 'Minh Long'),
(20, 'Trí Việt'),
(21, 'Nhà sách Minh Thắng'),
(22, 'MC Books'),
(23, 'Thái Hà'),
(24, 'Nhà sách Lao Động'),
(25, 'Panda Books'),
(26, 'NXB Tổng hợp'),
(27, 'NXB Khoa Học Xã Hội'),
(28, 'NXB Phương Đông'),
(29, 'NXB Dân Trí'),
(30, 'NXB Giáo Dục'),
(31, 'NXB Phương Bắc');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('F05lVA9WXyRnun9X8Sc5yTE5zlo68Cym', 1548577577, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"isLogged":true,"user":{"id":1,"firstname":"Phan","lastname":"Văn Dương","email":"duongpv@gmail.com","password":"e10adc3949ba59abbe56e057f20f883e","birthday":"1997-12-30T00:00:00.000Z","gender":0,"permission":1,"date":"2019-01-17T01:30:32.000Z"},"cart":[]}');

-- --------------------------------------------------------

--
-- Table structure for table `types`
--

CREATE TABLE `types` (
  `id` int(11) NOT NULL,
  `nameType` varchar(255) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `types`
--

INSERT INTO `types` (`id`, `nameType`) VALUES
(1, 'Truyện tranh'),
(2, 'Sách ngôn tình'),
(3, 'Sách kỹ năng sống'),
(4, 'Sách tham khảo'),
(5, 'Sách khoa học kỹ thuật'),
(6, 'Sách văn học'),
(7, 'Sách kinh tế'),
(8, 'Sách thiếu nhi'),
(9, 'Sách bà mẹ'),
(10, 'Sách ngoại ngữ'),
(11, 'Từ điển'),
(12, 'Giáo trình Đại học - Cao đẳng'),
(13, 'Sách kiến thức tổng hợp'),
(14, 'Sách lịch sử'),
(15, 'Sách điện ảnh - nhạc - họa'),
(16, 'Sách tôn giáo - tâm linh'),
(17, 'Sách văn hóa - du lịch'),
(18, 'Sách chính trị - Pháp lý'),
(19, 'Sách nông - lâm - ngư nghiệp'),
(20, 'Sách y học'),
(21, 'Tạp chí - Catoluge'),
(22, 'Sách tâm lý giới tính'),
(23, 'Sách thường thức - đời sống'),
(24, 'Trinh thám - Ngôn tình');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `lastname` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `permission` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`, `birthday`, `gender`, `permission`, `date`) VALUES
(1, 'Phan', 'Văn Dương', 'duongpv@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', '1997-12-30', 0, 1, '2019-01-17 06:30:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `publishing_company`
--
ALTER TABLE `publishing_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `types`
--
ALTER TABLE `types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;
--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=168;
--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;
--
-- AUTO_INCREMENT for table `publishing_company`
--
ALTER TABLE `publishing_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
--
-- AUTO_INCREMENT for table `types`
--
ALTER TABLE `types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
