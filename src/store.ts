import { writable } from 'svelte/store'

export const Auth = writable(null)
export enum Pages {
  Create,
  Read,
  Delete,
}
export const ActivePage = writable(Pages.Create)
export const AppName = "MyApp"