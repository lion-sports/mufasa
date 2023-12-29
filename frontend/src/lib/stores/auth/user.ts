import { writable } from "svelte/store";
import type { User } from "../../services/auth/auth.service";

let store = writable<User | undefined>(undefined)
export default store