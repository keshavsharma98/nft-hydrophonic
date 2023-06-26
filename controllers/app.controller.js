const db = require('../database')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

           
const appController = {
    Hello: (req,res)=> {
        res.status(200).json({msg: "Hello!!", data: req.body});
    },
    signUp: async(req,res) => {
        try{
            const { rows } = await db.query("select * from pg_user_info where username = $1", [req.body.username]);
            
            if(rows.length){
                res.status(409).json({msg:"User Already Exists"});
                return;
            }
            else{
                const { username, user_password } = req.body;

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user_password, salt);

                const sql = 'INSERT INTO pg_user_info (username, user_password) VALUES($1, $2) RETURNING id,username'

                const { rows } = await db.query(sql, [username, hashedPassword])

                res.status(201).json({msg: "User Created", data: rows[0]});
            }

        }
        catch(error){
            console.error(error);
            res.status(500).json({msg:"Internal Server Error"});
        }
    },

    login: async(req,res) => {
        try{
            const { rows } = await db.query("select * from pg_user_info where username = $1", [req.body.username]);

            if(!rows.length){
                res.status(404).json({msg:"User Does Not Exist"});
                return;
            }

            const isMatch = await bcrypt.compare(req.body.user_password, rows[0].user_password);
            
            if(!isMatch){
                res.status(401).json({msg:"Invalid Password"});
                return;
            }

            const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            delete rows[0].user_password;

            res.json({msg: "OK", data: {"user":rows[0],token}});

        }
        catch(error){
            console.error(error);
            res.status(500).json({msg:"Internal Server Error"});
        }
    }
}

module.exports = appController