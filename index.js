// Import required modules
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import PaperPlane from "./models/PaperPlane.js";
import morgan from 'morgan';
import { sendRedeemEmail } from "./services/redeemPaperPlaneCoin.js";


// Load environment variables
dotenv.config();
const morganFormat = '":method :url HTTP/:http-version" :status :res[content-length] ":referrer"';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(morgan(morganFormat, {
    stream: {
      write: (message) => {
        console.log(message); // Use console.log to output logs
      }
    }
  }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// CRUD Endpoints

// Create a new contact
app.post("/redeem_coins", async (req, res) => {
  try {
    // Create a new contact
    const newContact = new PaperPlane(req.body);
    
    // Save the contact to the database
    const savedContact = await newContact.save();
    
    // Extract necessary fields from the saved contact
    const { fullName, userEmail, redeemed_Coins, remainingCoins } = savedContact;

    // Prepare email data
    const emailData = {
      fullName,
      redeemed_Coins,
      remainingCoins,
      redeemUrl: "https://redeem.paperplane.com/login",
    };

    // Send the redeem email
    await sendRedeemEmail(
      userEmail, // recipient email address
      "Redeem Your Paper Plane Coins", // email subject
      "redeemCoins", // template name (ensure this corresponds to an actual EJS template)
      emailData // dynamic email data
    );
    
    // Respond with the saved contact data
    res.status(201).json({
      message: "Redeem email sent successfully!",
      contact: savedContact
    });
    } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(400).json({ error: error.message });
  }
});


// Read all contacts with pagination
app.get("/contacts", async (req, res) => {
  try {
    const { page, limit } = req.query;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    };
    const contacts = await PaperPlane.paginate({}, options);
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single contact by ID
app.get("/contacts/:id", async (req, res) => {
  try {
    const contact = await PaperPlane.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a contact by ID
app.put("/contacts/:id", async (req, res) => {
  try {
    const updatedContact = await PaperPlane.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a contact by ID
app.delete("/contacts/:id", async (req, res) => {
  try {
    const deletedContact = await PaperPlane.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
