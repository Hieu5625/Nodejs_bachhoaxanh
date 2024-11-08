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
  const { MAVACH, TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG } = req.body;
  const sql =
    "INSERT INTO hang (MAVACH, TENHANG,MOTAHANG,SOLUONGHIENCO,DANHMUCHANG) VALUES (?, ?, ?, ?, ?)";
  pool.query(
    sql,
    [MAVACH, TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG],
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
      });
    }
  );
});

// API PUT - Cập nhật sản phẩm
app.put("/api/products/:MAVACH", (req, res) => {
  const { MAVACH } = req.params;
  const { TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG } = req.body;
  const sql =
    "UPDATE hang SET TENHANG = ?, MOTAHANG = ?, SOLUONGHIENCO = ?, DANHMUCHANG = ? WHERE MAVACH = ?";
  pool.query(
    sql,
    [TENHANG, MOTAHANG, SOLUONGHIENCO, DANHMUCHANG, MAVACH],
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
    res.json({ message: "Xóa sản phẩm thành công!" });
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
    "INSERT INTO KHACHHANG (MA_KH, TEN_KH, HO_KH, SDT_KH, EMAIL_KH) VALUES (?, ?, ?, ?, ?)";
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

// API kiểm tra kết nối server
app.get("/", (req, res) => {
  res.send(" API server đang chạy.");
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
