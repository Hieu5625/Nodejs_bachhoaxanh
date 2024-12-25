const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
const config = {
  host: "127.0.0.1",
  user: "root",
  password: "098753159",
  database: "BHX",
};

// Tạo kết nối pool để quản lý kết nối hiệu quả hơn
const pool = mysql.createPool(config);
/* ==================================SẢN PHẨM=============================================================*/
// API GET - Lấy danh sách sản phẩm
app.get("/api/products", (req, res) => {
  const { search } = req.query;
  let sql = "SELECT * FROM hang";
  const params = [];

  if (search) {
    sql += " WHERE TENHANG LIKE ?";
    params.push(`%${search}%`);
  }

  pool.query(sql, params, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
    res.json(results);
  });
});

// API GET - Lấy danh mục sản phẩm
app.get("/api/categories", (req, res) => {
  const sql = "SELECT DISTINCT DANHMUCHANG FROM hang";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh mục sản phẩm:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh mục sản phẩm" });
    }
    res.json(results.map((row) => row.DANHMUCHANG));
  });
});

// API POST - Cập nhật số lượng sản phẩm từ phiếu nhập
app.post("/api/products/update-from-receipt", (req, res) => {
  const { SOPHIEUNHAPHANG } = req.body;

  const sql = `
    SELECT MAVACH, SUM(SOLUONGNHAP) AS TOTAL_QUANTITY
    FROM CHITIETNHAPHANG
    WHERE SOPHIEUNHAPHANG = ?
    GROUP BY MAVACH
  `;

  pool.query(sql, [SOPHIEUNHAPHANG], (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy chi tiết phiếu nhập:", error);
      return res.status(500).json({ error: "Lỗi khi lấy chi tiết phiếu nhập" });
    }

    const updatePromises = results.map((row) => {
      return new Promise((resolve, reject) => {
        const updateSql = `
          UPDATE hang
          SET SOLUONGHIENCO = SOLUONGHIENCO + ?
          WHERE MAVACH = ?
        `;
        pool.query(updateSql, [row.TOTAL_QUANTITY, row.MAVACH], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    Promise.all(updatePromises)
      .then(() => {
        res.json({ message: "Cập nhật số lượng thành công từ phiếu nhập!" });
      })
      .catch((updateError) => {
        console.error("Lỗi khi cập nhật số lượng:", updateError);
        res
          .status(500)
          .json({ error: "Lỗi khi cập nhật số lượng từ phiếu nhập" });
      });
  });
});

/* =========================== API KHÁCH HÀNG =========================== */

// API GET - Lấy danh sách khách hàng
app.get("/api/customers", (req, res) => {
  const sql = "SELECT MA_KH, HOTEN_KH, SDT_KH, EMAIL_KH FROM KHACHHANG";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy danh sách khách hàng" });
    }
    res.json(results);
  });
});

// API POST - Thêm khách hàng mới
app.post("/api/customers", (req, res) => {
  const { MA_KH, HOTEN_KH, SDT_KH, EMAIL_KH } = req.body;
  const sql =
    "INSERT INTO KHACHHANG (MA_KH, HOTEN_KH, SDT_KH, EMAIL_KH) VALUES (?, ?, ?, ?)";
  pool.query(sql, [MA_KH, HOTEN_KH, SDT_KH, EMAIL_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi thêm khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi thêm khách hàng" });
    }
    res.status(201).json({ MA_KH, HOTEN_KH, SDT_KH, EMAIL_KH });
  });
});

// API PUT - Cập nhật khách hàng
app.put("/api/customers/:MA_KH", (req, res) => {
  const { MA_KH } = req.params;
  const { HOTEN_KH, SDT_KH, EMAIL_KH } = req.body;
  const sql =
    "UPDATE KHACHHANG SET HOTEN_KH = ?, SDT_KH = ?, EMAIL_KH = ? WHERE MA_KH = ?";
  pool.query(sql, [HOTEN_KH, SDT_KH, EMAIL_KH, MA_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi cập nhật khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi cập nhật khách hàng" });
    }
    res.json({ message: "Cập nhật khách hàng thành công!" });
  });
});

// API DELETE - Xóa khách hàng
app.delete("/api/customers/:MA_KH", (req, res) => {
  const { MA_KH } = req.params;
  const sql = "DELETE FROM KHACHHANG WHERE MA_KH = ?";
  pool.query(sql, [MA_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi xóa khách hàng" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json({ message: "Xóa khách hàng thành công!" });
  });
});

/* =========================== API NHÂN VIÊN =========================== */

// API GET - Lấy danh sách nhân viên
app.get("/api/employees", (req, res) => {
  const sql =
    "SELECT MA_NV, HOTEN_NV, DATE_FORMAT(NGAYSINH, '%d-%m-%Y') AS NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV FROM nhanvien";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách nhân viên" });
    }
    res.json(results);
  });
});

// API POST - Thêm nhân viên mới
app.post("/api/employees", (req, res) => {
  const { MA_NV, HOTEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV } =
    req.body;
  const sql =
    "INSERT INTO nhanvien (MA_NV, HOTEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV) VALUES (?, ?, ?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MA_NV, HOTEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        return res.status(500).json({ error: "Lỗi khi thêm nhân viên" });
      }
      res.status(201).json({
        MA_NV,
        HOTEN_NV,
        NGAYSINH,
        DIACHI_NV,
        CHUCVU_NV,
        SDT_NV,
        EMAIL_NV,
      });
    }
  );
});

// API PUT - Cập nhật nhân viên
app.put("/api/employees/:MA_NV", (req, res) => {
  const { MA_NV } = req.params;
  const { HOTEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV } =
    req.body;
  const sql =
    "UPDATE nhanvien SET HOTEN_NV = ?, NGAYSINH = ?, DIACHI_NV = ?, CHUCVU_NV = ?, SDT_NV = ?, EMAIL_NV = ? WHERE MA_NV = ?";
  pool.query(
    sql,
    [HOTEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV, MA_NV],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return res.status(500).json({ error: "Lỗi khi cập nhật nhân viên" });
      }
      res.json({ message: "Cập nhật nhân viên thành công!" });
    }
  );
});

// API DELETE - Xóa nhân viên
app.delete("/api/employees/:MA_NV", (req, res) => {
  const { MA_NV } = req.params;
  const sql = "DELETE FROM nhanvien WHERE MA_NV = ?";
  pool.query(sql, [MA_NV], (error, result) => {
    if (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      return res.status(500).json({ error: "Lỗi khi xóa nhân viên" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json({ message: "Xóa nhân viên thành công!" });
  });
});

/* ==================================Lập Phiếu Nhập=============================================================*/
// API GET - Lấy danh sách phiếu nhập
app.get("/api/receipts", (req, res) => {
  const sql = `
    SELECT PHIEUNHAPHANG.SOPHIEUNHAPHANG, 
           NHANVIEN.HOTEN_NV, 
           PHIEUNHAPHANG.NHACUNGCAP, 
           DATE_FORMAT(PHIEUNHAPHANG.NGAYNHAPHANG, '%d-%m-%Y') AS NGAYNHAPHANG
    FROM PHIEUNHAPHANG
    JOIN NHANVIEN ON PHIEUNHAPHANG.MA_NV = NHANVIEN.MA_NV
  `;
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy danh sách phiếu nhập" });
    }
    res.json(results);
  });
});

// API GET - Lấy chi tiết phiếu nhập
app.get("/api/receipts/:SOPHIEUNHAPHANG", (req, res) => {
  const { SOPHIEUNHAPHANG } = req.params;
  const sql = `
    SELECT CHITIETNHAPHANG.SOPHIEUNHAPHANG,
           HANG.TENHANG,
           CHITIETNHAPHANG.SOLUONGNHAP,
           CHITIETNHAPHANG.DONGIANHAP,
           CHITIETNHAPHANG.CHATLUONGHANG
    FROM CHITIETNHAPHANG
    JOIN HANG ON CHITIETNHAPHANG.MAVACH = HANG.MAVACH
    WHERE CHITIETNHAPHANG.SOPHIEUNHAPHANG = ?
  `;
  pool.query(sql, [SOPHIEUNHAPHANG], (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy chi tiết phiếu nhập:", error);
      return res.status(500).json({ error: "Lỗi khi lấy chi tiết phiếu nhập" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết phiếu nhập" });
    }
    res.json(results);
  });
});
// API GET - Lấy danh sách nhà cung cấp không trùng lặp
app.get("/api/suppliers", (req, res) => {
  const sql = `
    SELECT DISTINCT NHACUNGCAP 
    FROM PHIEUNHAPHANG
    WHERE NHACUNGCAP IS NOT NULL
  `;
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách nhà cung cấp:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy danh sách nhà cung cấp" });
    }
    res.json(results.map((row) => row.NHACUNGCAP));
  });
});

// API POST - Thêm phiếu nhập hàng
app.post("/api/receipts", (req, res) => {
  const { SOPHIEUNHAPHANG, MA_NV, NHACUNGCAP, NGAYNHAPHANG } = req.body;
  const sql = `
    INSERT INTO PHIEUNHAPHANG (SOPHIEUNHAPHANG, MA_NV, NHACUNGCAP, NGAYNHAPHANG)
    VALUES (?, ?, ?, ?)
  `;
  pool.query(
    sql,
    [SOPHIEUNHAPHANG, MA_NV, NHACUNGCAP, NGAYNHAPHANG],
    (error) => {
      if (error) {
        console.error("Lỗi khi thêm phiếu nhập hàng:", error);
        return res.status(500).json({ error: "Lỗi khi thêm phiếu nhập hàng" });
      }
      res.status(201).json({ message: "Thêm phiếu nhập hàng thành công!" });
    }
  );
});

// API POST - Thêm chi tiết phiếu nhập hàng
app.post("/api/receipt-details", (req, res) => {
  const { SOPHIEUNHAPHANG, MAVACH, SOLUONGNHAP, DONGIANHAP } = req.body;
  const sql = `
    INSERT INTO CHITIETNHAPHANG (SOPHIEUNHAPHANG, MAVACH, SOLUONGNHAP, DONGIANHAP, CHATLUONGHANG)
    VALUES (?, ?, ?, ?, DEFAULT)
  `;
  pool.query(
    sql,
    [SOPHIEUNHAPHANG, MAVACH, SOLUONGNHAP, DONGIANHAP],
    (error) => {
      if (error) {
        console.error("Lỗi khi thêm chi tiết phiếu nhập hàng:", error);
        return res
          .status(500)
          .json({ error: "Lỗi khi thêm chi tiết phiếu nhập hàng" });
      }
      res.status(201).json({ message: "Thêm chi tiết phiếu nhập thành công!" });
    }
  );
});
/* ==================================Lập Phiếu Nhập=============================================================*/
// API GET - Lấy danh sách nhân viên
app.get("/api/employees", (req, res) => {
  const sql = "SELECT MA_NV, HOTEN_NV FROM NHANVIEN";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách nhân viên" });
    }
    res.json(results);
  });
});

// API GET - Lấy danh sách khách hàng
app.get("/api/customers", (req, res) => {
  const sql = "SELECT MA_KH, HOTEN_KH FROM KHACHHANG";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy danh sách khách hàng" });
    }
    res.json(results);
  });
});

// API POST - Thêm hóa đơn mới
app.post("/api/invoices", (req, res) => {
  const { MA_HD, MA_KH, MA_NV, NGAYLAPHOADON, DATHANHTOAN } = req.body;
  const sql =
    "INSERT INTO HOADON (MA_HD, MA_KH, MA_NV, NGAYLAPHOADON, DATHANHTOAN) VALUES (?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MA_HD, MA_KH, MA_NV, NGAYLAPHOADON, DATHANHTOAN],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi thêm hóa đơn:", error);
        return res.status(500).json({ error: "Lỗi khi thêm hóa đơn" });
      }
      res.status(201).json({ message: "Thêm hóa đơn thành công!" });
    }
  );
});

// API POST - Thêm chi tiết hóa đơn
app.post("/api/invoice-details", (req, res) => {
  const { MA_HD, MAVACH, SOLUONGBAN, GIAMGIA, THANHTIEN } = req.body;
  const sql =
    "INSERT INTO CHITIETHOADON (MA_HD, MAVACH, SOLUONGBAN, GIAMGIA, THANHTIEN) VALUES (?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MA_HD, MAVACH, SOLUONGBAN, GIAMGIA, THANHTIEN],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi thêm chi tiết hóa đơn:", error);
        return res.status(500).json({ error: "Lỗi khi thêm chi tiết hóa đơn" });
      }
      res.status(201).json({ message: "Thêm chi tiết hóa đơn thành công!" });
    }
  );
});
/* ==================================Đăng nhập=============================================================*/
// API Đăng nhập
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Sử dụng MA_NV thay vì EMAIL_NV
  const sql = "SELECT * FROM nhanvien WHERE MA_NV = ? AND MATKHAU_NV = ?";
  pool.query(sql, [username, password], (error, results) => {
    if (error) {
      console.error("Lỗi khi truy vấn:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }

    if (results.length > 0) {
      const user = results[0];

      // Định dạng lại ngày sinh thành dd-mm-yyyy
      const formattedDate = new Date(user.NGAYSINH);
      const day = formattedDate.getDate().toString().padStart(2, "0");
      const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = formattedDate.getFullYear();
      const formattedDateOfBirth = `${day}-${month}-${year}`;

      res.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: {
          id: user.MA_NV,
          name: user.HOTEN_NV,
          role: user.CHUCVU_NV,
          dateOfBirth: formattedDateOfBirth, // Trả về ngày sinh đã định dạng
          address: user.DIACHI_NV,
          phone: user.SDT_NV,
          email: user.EMAIL_NV,
        },
      });
    } else {
      res.json({ success: false, message: "Tên đăng nhập hoặc mật khẩu sai!" });
    }
  });
});

// API kiểm tra kết nối server
app.get("/", (req, res) => {
  res.send(" API server đang chạy.");
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
