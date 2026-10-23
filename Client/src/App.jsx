import { useState } from "react";
import "./App.css";
import Auth from "./Auth";


function App() {
  const API = "http://localhost:5000";
  const [weatherCity, setWeatherCity] = useState("Indore");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agritech_user") || "null");
    } catch {
      return null;
    }
  });
  const [section, setSection] = useState("dashboard");
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("agritech_token");

  async function loadSection(target = section) {
    if (!token) {
      setShowAuth(true);
      return;
    }

    const endpoints = {
      farms: "/api/farms",
      crops: "/api/crops",
      products: "/api/products",
      bookings: "/api/bookings",
    };

    if (!endpoints[target]) {
      setSection(target);
      return;
    }

    setSection(target);
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(API + endpoints[target], {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load data");
      }

      if (target === "farms") setFarms(data.farms || []);
      if (target === "crops") setCrops(data.crops || []);
      if (target === "products") setProducts(data.products || []);
      if (target === "bookings") setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  async function addFarm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/api/farms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.get("name"),
          location: {
            address: form.get("address"),
            city: form.get("city"),
            state: form.get("state"),
            pincode: form.get("pincode"),
          },
          size: Number(form.get("size")),
          sizeUnit: form.get("sizeUnit"),
          soilType: form.get("soilType"),
          irrigationType: form.get("irrigationType"),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add farm");

      event.currentTarget.reset();
      setMessage("Farm added successfully!");
      await loadSection("farms");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addCrop(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/api/crops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farm: form.get("farm"),
          name: form.get("name"),
          variety: form.get("variety"),
          plantingDate: form.get("plantingDate") || undefined,
          expectedHarvestDate: form.get("expectedHarvestDate") || undefined,
          growthStage: form.get("growthStage"),
          area: Number(form.get("area")),
          status: "active",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add crop");

      event.currentTarget.reset();
      setMessage("Crop added successfully!");
      await loadSection("crops");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.get("name"),
          category: form.get("category"),
          description: form.get("description"),
          brand: form.get("brand"),
          price: Number(form.get("price")),
          unit: form.get("unit"),
          stock: Number(form.get("stock")),
          isAvailable: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add product");

      event.currentTarget.reset();
      setMessage("Product added successfully!");
      await loadSection("products");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addBooking(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingType: form.get("bookingType"),
          title: form.get("title"),
          description: form.get("description"),
          scheduledDate: form.get("scheduledDate"),
          totalAmount: Number(form.get("totalAmount") || 0),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create booking");

      event.currentTarget.reset();
      setMessage("Booking created successfully!");
      await loadSection("bookings");
    } catch (err) {
      setError(err.message);
    }
  }

  const sections = [
    ["dashboard", "Dashboard"],
    ["farms", "My Farms"],
    ["crops", "Crop Tracking"],
    ["products", "Products"],
    ["bookings", "Bookings"],
    ["weather", "Weather Updates"],
  ];

  function renderRecords(items, fields) {
    if (!items.length) return <p>No records yet. Add your first one below.</p>;



    async function loadWeather(event) {
      event?.preventDefault();

      setWeatherLoading(true);
      setWeatherError("");
      setWeather(null);

      try {
        const cityResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherCity)}&count=1&language=en&format=json`
        );

        if (!cityResponse.ok) {
          throw new Error("Unable to find the city.");
        }

        const cityData = await cityResponse.json();
        const place = cityData.results?.[0];

        if (!place) {
          throw new Error("City not found. Try another city name.");
        }

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`
        );

        if (!weatherResponse.ok) {
          throw new Error("Unable to fetch weather data.");
        }

        const data = await weatherResponse.json();

        setWeather({
          city: place.name,
          region: place.admin1 || place.country || "",
          current: data.current,
          daily: data.daily,
        });
      } catch (error) {
        setWeatherError(error.message || "Weather request failed.");
      } finally {
        setWeatherLoading(false);
      }
    }
    return (
      <div className="feature-grid">
        {items.map((item) => (
          <article className="feature-card" key={item._id}>
            {fields.map(([label, key]) => (
              <p key={key}>
                <strong>{label}: </strong>
                {key.split(".").reduce((value, part) => value?.[part], item)
                  ?.toString() || "—"}
              </p>
            ))}
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="app">
      {showAuth && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={() => setShowAuth(false)}
              aria-label="Close authentication"
            >
              ✕
            </button>
            <Auth
              onLogin={(user) => {
                setLoggedInUser(user);
                setShowAuth(false);
                setSection("dashboard");
              }}
            />
          </div>
        </div>
      )}

      <nav className="navbar">
        <h2>🌱 AgriTech</h2>
        <div className="nav-links">
          {loggedInUser && (
            <span className="user-greeting">Hi, {loggedInUser.name}</span>
          )}
          <button className="login-btn" onClick={() => {
            if (!loggedInUser) setShowAuth(true);
            else loadSection("dashboard");
          }}>
            {loggedInUser ? "Dashboard" : "Login / Register"}
          </button>
          {loggedInUser && (
            <button className="login-btn" onClick={() => {
              localStorage.removeItem("agritech_token");
              localStorage.removeItem("agritech_user");
              setLoggedInUser(null);
              setSection("dashboard");
            }}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {!loggedInUser ? (
        <>
          <main id="home" className="hero">
            <div className="hero-content">
              <p className="eyebrow">SMART FARMING • BETTER FUTURE</p>
              <h1>Empowering Farmers Through Digital Technology</h1>
              <p className="hero-description">
                Manage farms, track crops, list agricultural products and
                organize farming services in one place.
              </p>
              <button className="primary-btn" onClick={() => setShowAuth(true)}>
                Get Started →
              </button>
            </div>
            <div className="hero-card">
              <div className="plant-icon">🌱</div>
              <h3>Smart Farming Dashboard</h3>
              <p>Your farm, connected and growing.</p>
              <div className="stats">
                <div><strong>24/7</strong><span>Farm Access</span></div>
                <div><strong>Smart</strong><span>Decisions</span></div>
              </div>
            </div>
          </main>

          <section id="features" className="features">
            <p className="eyebrow">OUR PLATFORM</p>
            <h2>Everything Your Farm Needs</h2>
            <div className="feature-grid">
              <article className="feature-card"><span>🌾</span><h3>Crop Monitoring</h3><p>Track crop growth and planting schedules.</p></article>
              <article className="feature-card"><span>🌦️</span><h3>Weather Updates</h3><p>Prepare for changing weather conditions.</p></article>
              <article className="feature-card"><span>🧪</span><h3>Soil Health</h3><p>Record soil and irrigation details.</p></article>
              <article className="feature-card"><span>📦</span><h3>Farm Resources</h3><p>Manage products and farming services.</p></article>
            </div>
          </section>
        </>
      ) : (
        <main className="features">
          <p className="eyebrow">FARMER WORKSPACE</p>
          <h1>Welcome, {loggedInUser.name}!</h1>
          <p className="section-description">
            Manage your farms and agricultural activities from one place.
          </p>

          <div className="feature-grid">
            {sections.map(([id, label]) => (
              <button
                className="feature-card"
                key={id}
                onClick={() => loadSection(id)}
              >
                <h3>{label}</h3>
                <p>{id === "dashboard" ? "Overview of your workspace" : `View and manage ${label.toLowerCase()}`}</p>
              </button>
            ))}
          </div>

          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
          {loading && <p>Loading...</p>}

          {section === "dashboard" && (
            <div className="feature-grid">
              <article className="feature-card"><h3>Farms</h3><p>Manage your farm details.</p></article>
              <article className="feature-card"><h3>Crops</h3><p>Track planting and harvest dates.</p></article>
              <article className="feature-card"><h3>Products</h3><p>List agricultural resources.</p></article>
              <article className="feature-card"><h3>Bookings</h3><p>Organize service bookings.</p></article>
            </div>
          )}
          {section === "weather" && (
            <section className="feature-card">
              <h2>🌦️ Weather Updates</h2>
              <p>Check current weather and a 3-day forecast for your city.</p>

              <form onSubmit={loadWeather}>
                <input
                  type="text"
                  value={weatherCity}
                  onChange={(event) => setWeatherCity(event.target.value)}
                  placeholder="Enter city name"
                  required
                />
                <button className="primary-btn" type="submit" disabled={weatherLoading}>
                  {weatherLoading ? "Loading..." : "Get Weather"}
                </button>
              </form>

              {weatherError && <p role="alert">{weatherError}</p>}

              {weather && (
                <>
                  <h3>{weather.city}, {weather.region}</h3>
                  <div className="feature-grid">
                    <article className="feature-card">
                      <h3>{weather.current.temperature_2m}°C</h3>
                      <p>Temperature</p>
                    </article>
                    <article className="feature-card">
                      <h3>{weather.current.apparent_temperature}°C</h3>
                      <p>Feels like</p>
                    </article>
                    <article className="feature-card">
                      <h3>{weather.current.relative_humidity_2m}%</h3>
                      <p>Humidity</p>
                    </article>
                    <article className="feature-card">
                      <h3>{weather.current.wind_speed_10m} km/h</h3>
                      <p>Wind speed</p>
                    </article>
                  </div>

                  <h3>3-Day Forecast</h3>
                  <div className="feature-grid">
                    {weather.daily.time.map((day, index) => (
                      <article className="feature-card" key={day}>
                        <h3>{day}</h3>
                        <p>Max: {weather.daily.temperature_2m_max[index]}°C</p>
                        <p>Min: {weather.daily.temperature_2m_min[index]}°C</p>
                        <p>Rain chance: {weather.daily.precipitation_probability_max[index]}%</p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {section === "farms" && (
            <>
              <h2>My Farms</h2>
              {renderRecords(farms, [["Farm", "name"], ["City", "location.city"], ["Size", "size"], ["Unit", "sizeUnit"], ["Soil", "soilType"]])}
              <h3>Add a Farm</h3>
              <form className="feature-card" onSubmit={addFarm}>
                <input name="name" placeholder="Farm name" required />
                <input name="address" placeholder="Address" required />
                <input name="city" placeholder="City" required />
                <input name="state" placeholder="State" required />
                <input name="pincode" placeholder="Pincode" required />
                <input name="size" type="number" min="0.1" step="any" placeholder="Farm size" required />
                <select name="sizeUnit"><option value="acre">Acre</option><option value="hectare">Hectare</option></select>
                <input name="soilType" placeholder="Soil type" />
                <input name="irrigationType" placeholder="Irrigation type" />
                <button className="primary-btn" type="submit">Add Farm</button>
              </form>
            </>
          )}

          {section === "crops" && (
            <>
              <h2>Crop Tracking</h2>
              {renderRecords(crops, [["Crop", "name"], ["Variety", "variety"], ["Stage", "growthStage"], ["Area", "area"], ["Status", "status"]])}
              <h3>Add a Crop</h3>
              {farms.length === 0 ? (
                <button className="primary-btn" onClick={() => loadSection("farms")}>Load farms / add a farm first</button>
              ) : (
                <form className="feature-card" onSubmit={addCrop}>
                  <select name="farm" required>{farms.map((farm) => <option key={farm._id} value={farm._id}>{farm.name}</option>)}</select>
                  <input name="name" placeholder="Crop name" required />
                  <input name="variety" placeholder="Variety" />
                  <label>Planting date <input name="plantingDate" type="date" /></label>
                  <label>Expected harvest <input name="expectedHarvestDate" type="date" /></label>
                  <select name="growthStage"><option value="planned">Planned</option><option value="seedling">Seedling</option><option value="vegetative">Vegetative</option><option value="flowering">Flowering</option><option value="harvesting">Harvesting</option><option value="harvested">Harvested</option></select>
                  <input name="area" type="number" min="0" step="any" placeholder="Area" />
                  <button className="primary-btn" type="submit">Add Crop</button>
                </form>
              )}
            </>
          )}

          {section === "products" && (
            <>
              <h2>Products</h2>
              {renderRecords(products, [["Product", "name"], ["Category", "category"], ["Price", "price"], ["Stock", "stock"], ["Brand", "brand"]])}
              <h3>Add a Product</h3>
              <form className="feature-card" onSubmit={addProduct}>
                <input name="name" placeholder="Product name" required />
                <select name="category"><option value="seeds">Seeds</option><option value="fertilizer">Fertilizer</option><option value="pesticide">Pesticide</option><option value="equipment">Equipment</option><option value="other">Other</option></select>
                <textarea name="description" placeholder="Description" />
                <input name="brand" placeholder="Brand" />
                <input name="price" type="number" min="0" step="any" placeholder="Price" required />
                <input name="unit" placeholder="Unit (e.g. bag)" required />
                <input name="stock" type="number" min="0" placeholder="Stock quantity" required />
                <button className="primary-btn" type="submit">Add Product</button>
              </form>
            </>
          )}

          {section === "bookings" && (
            <>
              <h2>Bookings</h2>
              {renderRecords(bookings, [["Title", "title"], ["Type", "bookingType"], ["Date", "scheduledDate"], ["Status", "status"], ["Amount", "totalAmount"]])}
              <h3>Create a Booking</h3>
              <form className="feature-card" onSubmit={addBooking}>
                <select name="bookingType"><option value="equipment">Equipment</option><option value="farming_service">Farming service</option><option value="expert_consultation">Expert consultation</option></select>
                <input name="title" placeholder="Booking title" required />
                <textarea name="description" placeholder="Description" />
                <label>Scheduled date <input name="scheduledDate" type="datetime-local" required /></label>
                <input name="totalAmount" type="number" min="0" placeholder="Amount" />
                <button className="primary-btn" type="submit">Create Booking</button>
              </form>
            </>
          )}
        </main>
      )}

      <footer id="about">
        <h3>🌱 AgriTech</h3>
        <p>Technology for smarter, more sustainable farming.</p>
        <p>AgriTech Project · Built with React, Express and MongoDB</p>
      </footer>
    </div>
  );
}

export default App;