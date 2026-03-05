<template>
  <div class="view-container">
    <header class="view-header">
      <h1 class="view-title">分切排产</h1>
      <p class="view-subtitle">分切机组生产计划与组合排料</p>
    </header>
    <div class="view-content">
      <div class="placeholder-card">
        <p>Slitting Scheduling Content Area</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  padding: 2rem;
  height: 100%;
}
.view-header {
  margin-bottom: 2rem;
}
.view-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}
.view-subtitle {
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.placeholder-card {
  background: var(--bg-surface);
  border: 1px dashed var(--border-medium);
  border-radius: 12px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>
