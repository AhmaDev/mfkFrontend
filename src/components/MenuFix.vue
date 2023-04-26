<template>
  <VSelect>
    <VuetifySelect @update:menu="menuOpened">
      <template
        v-for="(slot, index) of Object.keys($slots)"
        :key="index"
        v-slot:[slot]="slotProps"
      >
        <slot v-bind="slotProps" :name="slot"></slot>
      </template>
    </VuetifySelect>
  </VSelect>
</template>

<script setup lang="ts">
// This import is needed to prevent recursion (From Global Imports)
import { VSelect } from "vuetify/components/VSelect";

// [BAND AID FIX] For the menu opening in a outside
// of the window way For the first time for RTL View
// This should be disabled when Vuetify fixes the issue
const menuOpened = (isOpen: boolean) => {
  if (!isOpen) return;
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menus = (document as any).querySelectorAll(
      ".v-overlay-container .v-overlay .v-overlay__content"
    );
    if (!menus) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menus.forEach((menu: any) => {
      if (!menu.style.left.startsWith("-")) return;
      const right = menu.style.right;
      const left = menu.style.left;
      menu.style.left = right;
      menu.style.right = left.replace("-", "");
    });
  });
};
</script>

<style scoped></style>