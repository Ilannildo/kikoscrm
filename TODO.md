# KIKOS CRM — Dashboard Implementation

## Backend
- [x] 1. Create `apps/api/src/modules/dashboard/dashboard.controller.ts`
- [x] 2. Create `apps/api/src/modules/dashboard/dashboard.module.ts`
- [x] 3. Wire `DashboardModule` into `apps/api/src/infra/http/http.module.ts`

## Frontend — Data layer
- [x] 4. Create `apps/web/src/services/dashboard.service.ts`
- [x] 5. Create `apps/web/src/server/api/routers/dashboard.router.ts`
- [x] 6. Wire `dashboardRouter` into `apps/web/src/server/api/root.ts`

## Frontend — UI
- [x] 7. Create `apps/web/src/lib/activity.ts` (activity message mapping)
- [x] 8. Create `apps/web/src/components/dashboard/kpi-card.tsx`
- [x] 9. Create `apps/web/src/components/dashboard/pipeline-summary.tsx`
- [x] 10. Create `apps/web/src/components/dashboard/recent-activities.tsx`
- [x] 11. Create `apps/web/src/components/dashboard/recent-deals.tsx`
- [x] 12. Create `apps/web/src/components/dashboard/dashboard-skeleton.tsx`
- [x] 13. Edit `apps/web/src/app/(app)/dashboard/page.tsx`

## Verification
- [ ] Typecheck
- [ ] Lint
- [ ] Build
- [ ] Verify loading/error/empty states & responsiveness
