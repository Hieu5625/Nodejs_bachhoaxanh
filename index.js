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
  pool.query("SELECT * FROM hang", (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
    res.json(results);
  });
});

// API POST - Thêm sản phẩm mới
app.post("/api/products", (req, res) => {
  const { MAVACH, TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, DONGIA } =
    req.body;
  const sql =
    "INSERT INTO hang (MAVACH, TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, DONGIA) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MAVACH, TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, DONGIA],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        return res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
      }
      res.status(201).json({
        MAVACH: result.insertId,
        MAVACH,
        TENHANG,
        MOTAHANG,
        SOLUONGHIENCO,
        DANHMUCHANG,
        DONGIA,
      });
    }
  );
});

// API PUT - Cập nhật sản phẩm
app.put("/api/products/:MAVACH", (req, res) => {
  const { MAVACH } = req.params;
  const { TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, DONGIA } = req.body;
  const sql =
    "UPDATE hang SET TENHANG = ?, MOTAHANG = ?, SOLUONGHIENCO = ?, DANHMUCHANG = ?, DONGIA = ? WHERE MAVACH = ?";
  pool.query(
    sql,
    [TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, DONGIA, MAVACH],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        return res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm" });
      }
      res.json({ message: "Cập nhật sản phẩm thành công!" });
    }
  );
});

// API DELETE - Xóa sản phẩm
app.delete("/api/products/:MAVACH", (req, res) => {
  const { MAVACH } = req.params;
  const sql = "DELETE FROM hang WHERE MAVACH = ?";

  pool.query(sql, [MAVACH], (error, result) => {
    if (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      return res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
    }
    if (result.affectedRows > 0) {
      return res.json({ message: "Xóa sản phẩm thành công!" });
    } else {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  });
});

/* ==================================KHÁCH HÀNG=============================================================*/
// API GET - Lấy danh sách khách hàng
app.get("/api/Customers", (req, res) => {
  pool.query("SELECT * FROM KHACHHANG", (error, results) => {
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
app.post("/api/Customers", (req, res) => {
  const { MA_KH, HO_KH, TEN_KH, SDT_KH, EMAIL_KH } = req.body;
  const sql =
    "INSERT INTO KHACHHANG (MA_KH, HO_KH, TEN_KH, SDT_KH, EMAIL_KH) VALUES (?, ?, ?, ?, ?)";
  pool.query(sql, [MA_KH, HO_KH, TEN_KH, SDT_KH, EMAIL_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi thêm khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi thêm khách hàng" });
    }
    res.status(201).json({
      MA_KH,
      TEN_KH,
      HO_KH,
      SDT_KH,
      EMAIL_KH,
    });
  });
});

// API PUT - Cập nhật khách hàng
app.put("/api/Customers/:MA_KH", (req, res) => {
  const { MA_KH } = req.params;
  const { TEN_KH, HO_KH, SDT_KH, EMAIL_KH } = req.body;
  const sql =
    "UPDATE KHACHHANG SET TEN_KH = ?, HO_KH = ?, SDT_KH = ?, EMAIL_KH = ? WHERE MA_KH = ?";
  pool.query(sql, [TEN_KH, HO_KH, SDT_KH, EMAIL_KH, MA_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi cập nhật khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi cập nhật khách hàng" });
    }
    res.json({ message: "Cập nhật khách hàng thành công!" });
  });
});

// API DELETE - Xóa khách hàng
app.delete("/api/Customers/:MA_KH", (req, res) => {
  const { MA_KH } = req.params;
  const sql = "DELETE FROM KHACHHANG WHERE MA_KH = ?";
  pool.query(sql, [MA_KH], (error, result) => {
    if (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      return res.status(500).json({ error: "Lỗi khi xóa khách hàng" });
    }
    res.json({ message: "Xóa khách hàng thành công!" });
  });
});
/* ============================= NHÂN VIÊN ================================= */

// API GET - Lấy danh sách nhân viên
app.get("/api/employees", (req, res) => {
  const sql =
    "SELECT MA_NV, HO_NV, TEN_NV, DATE_FORMAT(NGAYSINH, '%d-%m-%Y') AS NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV FROM nhanvien";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách nhân viên" });
    }
    res.json(results);
  });
});

// API GET - Lấy thông tin nhân viên theo mã
app.get("/api/employees/:MA_NV", (req, res) => {
  const { MA_NV } = req.params;
  const sql =
    "SELECT MA_NV, HO_NV, TEN_NV, DATE_FORMAT(NGAYSINH, '%d-%m-%Y') AS NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV FROM nhanvien WHERE MA_NV = ?";
  pool.query(sql, [MA_NV], (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy thông tin nhân viên:", error);
      return res.status(500).json({ error: "Lỗi khi lấy thông tin nhân viên" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json(results[0]);
  });
});

// API POST - Thêm nhân viên mới
app.post("/api/employees", (req, res) => {
  const {
    MA_NV,
    HO_NV,
    TEN_NV,
    NGAYSINH,
    DIACHI_NV,
    CHUCVU_NV,
    SDT_NV,
    EMAIL_NV,
  } = req.body;

  const sql =
    "INSERT INTO nhanvien (MA_NV, HO_NV, TEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MA_NV, HO_NV, TEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        return res.status(500).json({ error: "Lỗi khi thêm nhân viên" });
      }

      const getEmployeeSql =
        "SELECT MA_NV, HO_NV, TEN_NV, DATE_FORMAT(NGAYSINH, '%d-%m-%Y') AS NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV FROM nhanvien WHERE MA_NV = ?";
      pool.query(getEmployeeSql, [MA_NV], (err, rows) => {
        if (err) {
          console.error("Lỗi khi lấy nhân viên vừa thêm:", err);
          return res
            .status(500)
            .json({ error: "Lỗi khi lấy nhân viên vừa thêm" });
        }
        res.status(201).json(rows[0]);
      });
    }
  );
});

// API PUT - Cập nhật thông tin nhân viên
app.put("/api/employees/:MA_NV", (req, res) => {
  const { MA_NV } = req.params;
  const { HO_NV, TEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV } =
    req.body;

  const sql =
    "UPDATE nhanvien SET HO_NV = ?, TEN_NV = ?, NGAYSINH = ?, DIACHI_NV = ?, CHUCVU_NV = ?, SDT_NV = ?, EMAIL_NV = ? WHERE MA_NV = ?";
  pool.query(
    sql,
    [HO_NV, TEN_NV, NGAYSINH, DIACHI_NV, CHUCVU_NV, SDT_NV, EMAIL_NV, MA_NV],
    (error, result) => {
      if (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return res.status(500).json({ error: "Lỗi khi cập nhật nhân viên" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
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
          name: `${user.HO_NV} ${user.TEN_NV}`,
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
