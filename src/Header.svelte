<script lang="ts">
  import { getContext } from "svelte"
  import { Auth, ActivePage, AppName, Pages } from "./store"
  import {
    SkipToContent,
    Header,
    HeaderUtilities,
    HeaderGlobalAction,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
  } from "carbon-components-svelte"
  import Logout20 from "carbon-icons-svelte/lib/Logout20"

  const ctx: {
    dark: any
    light: any
    updateVar: any
  } = getContext("Theme")

  $: if (ctx) {
    ctx.dark.subscribe((value) => {
      console.log("dark mode?", value)
    })
    ctx.light.subscribe((value) => {
      console.log("light mode?", value)
    })
    ctx.updateVar("--cds-productive-heading-06-font-size", "4rem")
  }

  function logout() {
    $Auth = null
    localStorage.clear()
  }

  export let theme
  let themes = [
    { value: "white", text: "White" },
    { value: "g10", text: "Light" },
    { value: "g90", text: "Dark" },
    { value: "g100", text: "Black" },
  ]

  $: console.log($ActivePage)
</script>

<Header company="⭕" platformName={AppName} href="/">
  <div slot="skip-to-content">
    <SkipToContent />
  </div>
  {#if $Auth != null}
    <HeaderNav>
      <HeaderNavItem on:click={() => ($ActivePage = Pages.Read)} text="Read" />
      <HeaderNavItem
        on:click={() => ($ActivePage = Pages.Create)}
        text="Create"
      />
    </HeaderNav>
    <HeaderUtilities>
      <HeaderGlobalAction
        style="margin: 0 0.5rem 0 0.5rem"
        aria-label="Logout"
        icon={Logout20}
        on:click={logout}
      />
    </HeaderUtilities>
  {:else}
    <HeaderUtilities />
  {/if}
  <div>
    <HeaderNav>
      <HeaderNavMenu
        style="padding: 0.5rem; margin-right: 1rem;"
        text={`Theme: ${themes.filter((obj) => obj.value == theme)[0].text}`}
      >
        {#each themes as themeObj}
          <HeaderNavItem
            text={themeObj.text}
            on:click={() => (theme = themeObj.value)}
          />
        {/each}
      </HeaderNavMenu>
    </HeaderNav>
  </div>
</Header>
