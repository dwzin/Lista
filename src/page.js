const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const knex = require('knex');
const knexConfig = require('../knexfile');
const stripe = require('stripe')('sk_test_51PdJpwB9ySyyZu5hXto3U9uvu2dCHQVj46y7DMrz597d2ebZjIJNW5Ue49zMw7TvH1lYxHYAb6j3OmWVdZZ9d15X00FWMP3pJK');

const app = express();
const port = 3000;
let totalPrice = 0;


const db = knex(knexConfig);

app.use(session({
  secret: 'dw',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

app.post('/addToCart', async (req, res) => {
    const itemPrice = parseFloat(req.body.price); 
    totalPrice += itemPrice; 

    console.log(`Preço total atualizado: R$${totalPrice.toFixed(2)}`);

    const userId = req.session.user.id;

    try {
        const cartEntry = await db("carrinho")
            .where({ user_id: userId })
            .first();

        if (cartEntry) {
            await db("carrinho")
                .where({ user_id: userId })
                .update({ total: totalPrice });
        } else {
            await db("carrinho").insert({ user_id: userId, total: totalPrice });
        }

        res.redirect('/store');
    } catch(error) {
        console.error("Error updating cart:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/store', (req, res) => {
    if (req.session.user) {
        res.render('store', { 
            totalPrice: totalPrice.toFixed(2),
            user: req.session.user 
        });
    } else {
        res.redirect('/');
    }
});





app.get("/signup", (req, res) => {
    res.render("signup");
  });
  
  app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const inserted_user = await db("users").insert({ username, password });
      console.log("User inserted successfully:", inserted_user);
      res.redirect("/")
    } catch (error) {
      console.error("Error inserting user:", error);
      res.status(500).send("Internal Server Error");
    }
  });

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db('users').where({
      username: username,
      password: password
    }).first();

    if (!user) {
      return res.status(404).send('User not found or incorrect password');
    }

    req.session.user = user;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user });
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

app.get('/gotostore', (req, res) => {
      res.redirect('/store');
    });

    app.post('/checkout', async (req, res) => {
      try {
        
        const charge = await stripe.charges.create({
          amount: totalPrice,
          currency: 'usd',
          source: 'tok_visa',  
          description: 'Testing charge',
        });
    

        console.log(charge);
    
        
        res.send(`Transaction Concluded, Price: ${totalPrice}`);
    
        
        res.redirect('/store');
      } catch (error) {
        
        console.error(error);
        res.status(500).send('Erro ao processar pagamento');
      }
    });



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
