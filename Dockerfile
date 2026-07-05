# Strelko – statični SPA (produkcijski dist) + nginx
#
# Pomembno: dejanska produkcija je v dist/ (index-DijleoXU.js …).
# src/main.js je za razvoj; ne zaganjajte `npm run build` za deploy, če dist
# ni usklajen z src — sicer se povrne stara različica aplikacije.
FROM nginx:1.27-alpine

COPY dist /usr/share/nginx/html

# Konfiguracija se mounta iz StormAPI/docker/strelko-nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
