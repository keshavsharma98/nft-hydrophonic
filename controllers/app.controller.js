const db = require("../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uploadFile = require("../middleware");
var serviceAccount = require("../nft-hydrophonic-firebase-adminsdk-ucnaz-67189a75f7.json");
const firebaseAdmin = require("firebase-admin");
var firebase = require("firebase/app");
const firebaseStorage = require("firebase/storage");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

var app = firebaseAdmin.app();

firebase.initializeApp(serviceAccount);

const appController = {
  Hello: (req, res) => {
    res.status(200).json({ msg: "Hello!!", data: req.body });
  },

  signUp: async (req, res) => {
    try {
      const { rows } = await db.query(
        "select * from pg_user_info where username = $1",
        [req.body.username]
      );

      if (rows.length) {
        res.status(409).json({ msg: "User Already Exists" });
        return;
      } else {
        const { username, user_password, user_token } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user_password, salt);
        const time1 = new Date().toISOString();
        const time2temp = new Date();
        time2temp.setDate(time2temp.getDate() + 30);
        const time2 = time2temp.toISOString();

        const sql2 =
          "INSERT INTO plant (plant_type,days_until_harvest,harvest_start_date,harvest_end_date,ppm_value,ph_value,temperature_value,humidity_value,lux_value,water_flow_value,nutsol_reservoir_level,water_reservoir_level,nutrient_a_value,nutrient_b_value,ph_up_value,ph_down_value) values ('lettuce',30,$1,$2,1,1.0,1.0,1,1,1,1,1,1,1,1,1) RETURNING *";
        const rows2 = await db.query(sql2, [time1, time2]);

        const sql =
          "INSERT INTO pg_user_info (username, user_password, plant_id, user_tokens) VALUES($1, $2, $3, $4) RETURNING id,username";

        const { rows } = await db.query(sql, [
          username,
          hashedPassword,
          rows2["rows"][0].id,
          user_token,
        ]);

        rows[0]["crop"] = rows2["rows"][0];
        res.status(201).json({ msg: "User Created", data: { user: rows[0] } });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    try {
      const { rows } = await db.query(
        "select * from pg_user_info join plant on plant.id = pg_user_info.plant_id where pg_user_info.username = $1",
        [req.body.username]
      );

      if (!rows.length) {
        res.status(404).json({ msg: "User Does Not Exist" });
        return;
      }

      const isMatch = await bcrypt.compare(
        req.body.user_password,
        rows[0].user_password
      );

      if (!isMatch) {
        res.status(401).json({ msg: "Invalid Password" });
        return;
      }

      const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      delete rows[0].user_password;

      res.json({ msg: "OK", data: { user: rows[0], token } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  updateVariables: async (req, res) => {
    try {
      const plant_id = req.params.id;
      const body = req.body;

      var { rows } = await db.query("select * from plant where plant.id = $1", [
        plant_id,
      ]);

      if (!rows.length) {
        res.status(404).json({ msg: "Plant Does Not Exist" });
        return;
      }

      for (var key in body) {
        if (rows[0].hasOwnProperty(key)) {
          rows[0][key] = body[key];
        }
      }

      const sql =
        "UPDATE plant SET days_until_harvest = $1, harvest_start_date = $2, harvest_end_date = $3, ppm_value = $4, ph_value = $5, temperature_value = $6, humidity_value = $7, lux_value = $8, water_flow_value = $9, nutsol_reservoir_level = $10, water_reservoir_level = $11, nutrient_a_value = $12, nutrient_b_value = $13, ph_up_value = $14, ph_down_value = $15 where plant.id = $16 RETURNING *";

      const rows2 = await db.query(sql, [
        rows[0]["days_until_harvest"],
        rows[0]["harvest_start_date"],
        rows[0]["harvest_end_date"],
        rows[0]["ppm_value"],
        rows[0]["ph_value"],
        rows[0]["temperature_value"],
        rows[0]["humidity_value"],
        rows[0]["lux_value"],
        rows[0]["water_flow_value"],
        rows[0]["nutsol_reservoir_level"],
        rows[0]["water_reservoir_level"],
        rows[0]["nutrient_a_value"],
        rows[0]["nutrient_b_value"],
        rows[0]["ph_up_value"],
        rows[0]["ph_down_value"],
        plant_id,
      ]);

      res.json({ msg: "Update Successful", data: rows2.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  reset: async (req, res) => {
    try {
      const plant_id = req.params.id;

      var { rows } = await db.query("select * from plant where plant.id = $1", [
        plant_id,
      ]);

      if (!rows.length) {
        res.status(404).json({ msg: "Plant Does Not Exist" });
        return;
      }

      const sql =
        "UPDATE plant SET days_until_harvest = $1, harvest_start_date = $2, harvest_end_date = $3, ppm_value = $4, ph_value = $5, temperature_value = $6, humidity_value = $7, lux_value = $8, water_flow_value = $9, nutsol_reservoir_level = $10, water_reservoir_level = $11, nutrient_a_value = $12, nutrient_b_value = $13, ph_up_value = $14, ph_down_value = $15 where plant.id = $16 RETURNING *";

      const time1 = new Date().toISOString();
      const time2temp = new Date();
      time2temp.setDate(time2temp.getDate() + 30);
      const time2 = time2temp.toISOString();

      const rows2 = await db.query(sql, [
        30,
        time1,
        time2,
        1,
        1.0,
        1.0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        plant_id,
      ]);

      res.json({ msg: "Reset Successful", data: rows2.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  getVariables: async (req, res) => {
    try {
      const plant_id = req.params.id;

      var { rows } = await db.query("select * from plant where plant.id = $1", [
        plant_id,
      ]);

      if (!rows.length) {
        res.status(404).json({ msg: "Plant Does Not Exist" });
        return;
      }

      res.json({ msg: "OK", data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  imageAndDiseasesUpload: async (req, res) => {
    try {
      var imageURL;
      await uploadFile(req, res);

      const file = req.file.buffer;
      const defaultStorage = firebaseStorage.getStorage();

      const metadata = {
        contentType: req.file.mimetype,
      };

      const storageRef = firebaseStorage.ref(
        defaultStorage,
        `notification-images/${new Date().toISOString()}--${
          req.file.originalname
        }`
      );
      const uploadTask = firebaseStorage.uploadBytesResumable(
        storageRef,
        file,
        metadata
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error(error);
          res.status(500).json({ msg: "Internal Server Error" });
        },
        () => {
          firebaseStorage
            .getDownloadURL(uploadTask.snapshot.ref)
            .then(async (downloadURL) => {
              imageURL = downloadURL;
              console.log("File available at", downloadURL);

              var { diseases_type, user_id } = req.body;
              user_id = parseInt(user_id);
              const sql =
                "INSERT INTO diseases (diseases_type,user_id,photo_url) values($1,$2,$3) RETURNING *";

              const { rows } = await db.query(sql, [
                diseases_type,
                user_id,
                imageURL,
              ]);

              const sql2 = "select user_tokens from pg_user_info where id=$1";

              var reg_ids = await db.query(sql2, [user_id]);
              var notification_id = rows[0]["id"].toString();
              const messaging = app.messaging();
              var payload = {
                notification: {
                  title: "Disease Found",
                  body: "Actions are required",
                },
                data: {
                  notification_id,
                },
                topic: "topic",
                tokens: [reg_ids["rows"][0].user_tokens],
              };

              messaging
                .sendEachForMulticast(payload)
                .then((result) => {
                  console.log(result);
                })
                .catch((error) => {
                  console.log("Error sending message:", error);
                });

              res.json({ msg: "Success", data: rows });
            });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  getAllNotifications: async (req, res) => {
    try {
      const sql =
        "Select id,diseases_type,photo_url from diseases where user_id = $1";

      const { rows } = await db.query(sql, [req.params.id]);

      res.json({ msg: "OK", data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  getNotificationById: async (req, res) => {
    try {
      const sql = "Select * from diseases where user_id = $1";

      var { rows } = await db.query(sql, [req.params.id]);

      switch (rows[0].diseases_type) {
        case "Tip Burn":
          rows[0]["actions_taken"] = ["Action 1", "Action 2", "Action 3"];
          break;
        case "Yellowing":
          rows[0]["actions_taken"] = ["Action 1", "Action 2", "Action 3"];
          break;
      }

      rows[0]["user_actions"] = ["Action 1", "Action 2", "Action 3"];

      res.json({ msg: "OK", data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },
};

module.exports = appController;
