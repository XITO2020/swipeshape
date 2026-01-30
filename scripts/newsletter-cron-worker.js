"use strict";
// scripts/newsletter-cron-worker.ts
// Script Node.js à lancer en cron ou via un scheduler (ex: PM2, GitHub Actions, Vercel Cron, etc.)
// Il envoie toutes les newsletters planifiées dont la date d'envoi est passée et non encore envoyées.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var email_service_1 = require("../src/services/email.service");
var newsletter_service_1 = require("../src/services/newsletter.service");
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, schedules, error, _i, schedules_1, schedule, _b, newsletter, newsletterError, subscribers, subject, htmlContent, textContent, recipients, sent;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[".concat(new Date().toISOString(), "] D\u00E9marrage du worker newsletter..."));
                    return [4 /*yield*/, supabase
                            .from('newsletter_schedules')
                            .select('id, newsletter_id, send_at, sent_at')
                            .is('sent_at', null)
                            .lte('send_at', new Date().toISOString())];
                case 1:
                    _a = _c.sent(), schedules = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erreur récupération des planifications:', error);
                        process.exit(1);
                    }
                    if (!schedules || schedules.length === 0) {
                        console.log('Aucune newsletter à envoyer.');
                        process.exit(0);
                    }
                    _i = 0, schedules_1 = schedules;
                    _c.label = 2;
                case 2:
                    if (!(_i < schedules_1.length)) return [3 /*break*/, 9];
                    schedule = schedules_1[_i];
                    return [4 /*yield*/, supabase
                            .from('newsletters')
                            .select('*')
                            .eq('id', schedule.newsletter_id)
                            .maybeSingle()];
                case 3:
                    _b = _c.sent(), newsletter = _b.data, newsletterError = _b.error;
                    if (newsletterError || !newsletter) {
                        console.error('Newsletter introuvable pour la planification:', schedule.id);
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, (0, newsletter_service_1.getSubscribersFromDatabase)()];
                case 4:
                    subscribers = _c.sent();
                    if (!subscribers.length) {
                        console.warn('Aucun abonné actif pour l’envoi de la newsletter planifiée:', schedule.id);
                        return [3 /*break*/, 8];
                    }
                    subject = newsletter.title || 'Newsletter SwipeShape';
                    htmlContent = newsletter.content;
                    textContent = htmlContent.replace(/<[^>]+>/g, '');
                    recipients = subscribers.map(function (sub) { return ({ email: sub.email, name: sub.name }); });
                    return [4 /*yield*/, (0, email_service_1.sendNewsletter)(recipients, subject, htmlContent, textContent)];
                case 5:
                    sent = _c.sent();
                    if (!sent) return [3 /*break*/, 7];
                    // 5. Marquer comme envoyée
                    return [4 /*yield*/, supabase
                            .from('newsletter_schedules')
                            .update({ sent_at: new Date().toISOString() })
                            .eq('id', schedule.id)];
                case 6:
                    // 5. Marquer comme envoyée
                    _c.sent();
                    console.log("Newsletter ".concat(newsletter.id, " envoy\u00E9e \u00E0 ").concat(recipients.length, " abonn\u00E9s (planif ").concat(schedule.id, ")."));
                    return [3 /*break*/, 8];
                case 7:
                    console.error('Erreur lors de l’envoi de la newsletter planifiée:', schedule.id);
                    _c.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(function (e) {
    console.error('Erreur fatale worker:', e);
    process.exit(1);
});
