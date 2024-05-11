import app from "./app.js";
import connectToDb from "./config/db.js";

const port = process.env.PORT || 5009;

app.listen(port, async()=> {
    console.log(`listening on http://localhost:${port}`)
    await connectToDb();
})