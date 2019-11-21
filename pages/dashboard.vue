<template>
  <b-card>
    <h1 class="text-center font-weight-bold" style="color:#213265;">{{ team }}</h1>
    <b-row class="text-center mt-5">
      <b-col v-for="(item, index) in teams" :key="index">
        <h3 class="font-weight-bold" style="color:#213265;">{{ item.name }}</h3>
        <p>{{item.nim}}</p>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  data() {
    return {
      team: "Kelompok 1",
      teams: [
        {
          name: "Dwi Febri Murcahyo",
          nim: "123160004"
        },
        {
          name: "Rasyid Prayoga",
          nim: "123160009"
        },
        {
          name: "Alam Esa Wikanning Katon",
          nim: "123160012"
        },
        {
          name: "Ardian Tri Kusuma",
          nim: "123160035"
        }
      ]
    };
  }
};
</script>
