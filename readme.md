```markdown
🍔 Food Delivery App (React Native + Node.js)

A full-stack food delivery application built using **React Native (Expo)** for the frontend and **Node.js + MongoDB** for the backend. This app allows users to browse restaurants, place orders, track deliveries, and restaurant owners to manage their listings.


---

## 🚀 Features

### 🧑‍🍳 User Side
- Login/SignUp
- Browse Restaurants by Category
- View Dishes in Restaurants
- Add to Cart & Place Orders
- Track Orders (Preparing / Delivering)

### 🏢 Restaurant Owner Side
- Login as Owner
- Add/Manage Restaurants & Dishes
- View Incoming Orders

---

## 🛠️ Tech Stack

### 📱 Frontend (Expo React Native)
- React Native
- Expo CLI
- Redux Toolkit
- AsyncStorage
- Tailwind CSS (via NativeWind)
- Axios
- React Navigation

### 🌐 Backend (Node.js)
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (Image Uploads)
- dotenv

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/food-delivery.git
cd food-delivery
````

---

### 2. Setup Backend

```bash
cd backend
npm install
```

* Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/fooddelivery
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
PUBLIC_KEY=your_public_key_here
```

* Start the server:

```bash
npm run dev
```

---

### 3. Setup React Native App

```bash
cd ../my-expo-app
npm install
```

* Create a `.env` file:

```env
API_URL=http://localhost:5000
```

> Note: Use your LAN IP (e.g. `http://192.168.1.x:5000`) if running on physical mobile device.

* Start the app:

```bash
npx expo start
```


## 🚀 Features

- 🏠 Home screen with featured restaurants
- 📂 Category & Dish listing
- 🍽️ Restaurant detail page
- 🛒 Add to cart functionality
- 📦 Order tracking interface
- ⚡ Optimized UI with Tailwind CSS

---

## 📸 Screenshots

<div align="center">

| Login Screen | SignUp screen | Login Success full |
|------|------------|------------|
| ![Screenshot_1753177431](./my-expo-app/assets/Screenshot_1753177431.png) | ![Screenshot_1753177448](./my-expo-app/assets/Screenshot_1753177448.png) | ![Screenshot_1753177564](./my-expo-app/assets/Screenshot_1753177564.png) |

| Restaurant Owner form | Restaurant Home Screen | Restaurant Home screen |Restaurant Home screen |
|------------|------|-----------------|-----------------|
| ![Screenshot_1753177587](./my-expo-app/assets/Screenshot_1753177587.png) | ![Screenshot_1753178174](./my-expo-app/assets/Screenshot_1753178174.png) | ![Screenshot_1753178697](./my-expo-app/assets/Screenshot_1753178697.png) |![Screenshot_1753178689](./my-expo-app/assets/Screenshot_1753178689.png) |

| User Home screen | select Restaurant | Cart Screen |
|-----------------|--------------------|
| ![Screenshot_1753178576](./my-expo-app/assets/Screenshot_1753178576.png) | ![Screenshot_1753178585](./my-expo-app/assets/Screenshot_1753178585.png) | ![Screenshot_1753178591](./my-expo-app/assets/Screenshot_1753178591.png) |

| Delivery Screen | My Order screen | Order details screen |
|-----------------|--------------------|
| ![Screenshot_1753178599](./my-expo-app/assets/Screenshot_1753178599.png) | ![Screenshot_1753178880](./my-expo-app/assets/Screenshot_1753178880.png) |  | ![Screenshot_1753178948](./my-expo-app/assets/Screenshot_1753178948.png) |


| ![Screenshot_1753178594](./my-expo-app/assets/Screenshot_1753178594.png) || ![Screenshot_1753178950](./my-expo-app/assets/Screenshot_1753178950.png) |
</div>

---

## 📦 API Endpoints Overview

* `/api/category` – Get Categories
* `/api/featured` – Get Featured Restaurants
* `/api/user` – Auth (Signup/Login)
* `/api/order` – Place/Fetch Orders

---

## 📚 Environment Variable Setup

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fooddelivery
JWT_SECRET=yourSecretKey
```

### Frontend `.env`

```env
API_URL=http://192.168.1.xx:5000
```

Use Expo's `expo-env` or `babel-plugin-dotenv` to access these in code:

```ts
import { API_URL } from "@env";
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Author

Made with ❤️ by \[Your Name]

```

---

Let me know if you want me to also generate a table of APIs, preview actual `API_URL` usage, or create `.env.example` files.
```
