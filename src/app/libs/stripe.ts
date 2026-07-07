import Stripe from "stripe";
import env from "../configs/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export default stripe;
