<script lang="ts">
  import { Auth, ActivePage, Pages, UrlParams } from "./store"
  import { Content, Grid, Row, Column } from "carbon-components-svelte"
  import Theme from "./Theme.svelte"
  import Header from "./Header.svelte"
  import Login from "./Login.svelte"
  import CreateToDo from "./CreateToDo.svelte"
  import ReadToDos from "./ReadToDos.svelte"

  let theme = "white"
  $: loggedIn = $Auth != null
</script>

<Theme persist bind:theme>
  <Header bind:theme />
  <Content style="background: none; padding: 4rem">
    <Grid narrow padding>
      <img
        alt="Logo"
        src="logo.png"
        style="width:65px; height:65px; margin-bottom:2rem;"
      />

      {#if loggedIn}
        {#if $ActivePage == Pages.Create}
          <Row>
            <Column lg={6} md={4}>
              <CreateToDo />
            </Column>
          </Row>
        {:else if $ActivePage == Pages.Read}
          <Row>
            <Column>
              <ReadToDos />
            </Column>
          </Row>
        {/if}
      {:else}
        <Row>
          <Column lg={6} md={4}>
            <Login />
          </Column>
        </Row>
      {/if}
    </Grid>
  </Content>
</Theme>
