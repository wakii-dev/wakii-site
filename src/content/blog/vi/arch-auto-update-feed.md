---
title: "Auto-update feed: từ release tới máy người dùng"
description: "Vòng đời đầy đủ của một bản cập nhật qua code thật: asset version-named, check 24 giờ trong process main, pin feed theo tag cụ thể, và quit-and-install an toàn."
pubDate: "2026-09-27"
category: "tech"
tags: ["architecture", "release"]
draft: false
---

Nút "Download" trên trang này chỉ là nửa đầu của câu chuyện. Nửa còn lại bắt đầu khi app đã nằm trong máy: nó biết có bản mới bằng cách nào, vì sao một release đang được đăng giữa chừng không làm ai tải dở, và từ trạng thái "có bản mới" tới "đã cài xong" phải đi qua những chốt nào. Toàn bộ code auto-update của Wakii nằm trong repo công khai `wakii-dev/wakii`; bài này đi theo đúng dòng đời một bản cập nhật — từ GitHub Releases tới nút relaunch trong app.

TL;DR:

- Mỗi release là một tag kèm manifest theo nền tảng (latest-mac.yml, latest.yml…) và asset version-named — số phiên bản nằm ngay trong tên file.
- App kiểm feed 24 giờ một lần; timer nằm trong process main nên không phụ thuộc việc app có được mở lại hay không.
- Thấy tag mới, updater không ăn theo URL "latest" — nó pin đúng tag cụ thể và kiểm manifest của tag đó đã sẵn sàng chưa, để không tải dỡ một release đang đăng.
- Cài đặt có chốt riêng: macOS đợi installer sẵn sàng mới thoát app; Linux do package manager quản lý thì bị chặn download kèm thông báo cụ thể.

## Một release là gì: tag, manifest, asset version-named

Bắt đầu từ phía kho chứa. Một release của Wakii trên GitHub Releases nhìn thế này:

```ascii
$ gh release list --repo wakii-dev/wakii --limit 3
Wakii 1.4.199	Latest	v1.4.199	2026-09-05T19:07:31Z
Wakii 1.4.198		v1.4.198	2026-09-05T12:47:15Z
Orca Mobile Android mobile-android-v0.0.48	Pre-release	mobile-android-v0.0.48	2026-09-05T13:00:31Z

$ gh release view v1.4.199 --repo wakii-dev/wakii --json assets --jq '.assets[].name'
app-release.apk
latest-mac.yml
latest.yml
orca-windows-setup.exe
orca-windows-setup.exe.blockmap
Wakii-1.4.199-arm64.dmg
Wakii-1.4.199-local.1788637424492.96e3bc586254-arm64-mac.zip
Wakii-1.4.199-local.1788637424492.96e3bc586254-mac.zip
Wakii-1.4.199-x64.dmg
```
*Lệnh `gh` chỉ đọc trên repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Listing đó có ba loại file đáng để tách riêng. Asset macOS mang số phiên bản ngay trong tên — `Wakii-1.4.199-x64.dmg` — còn mọi URL asset đều được pin theo tag, nhìn link đã biết nó trỏ về bản nào, không cần đoán. Hai file `.yml` là manifest: `latest-mac.yml` cho macOS, `latest.yml` cho Windows. Tên manifest không phải ngẫu nhiên mà do updater tự chọn theo nền tảng:

```ts
// src/main/updater-prerelease-feed.ts
function getPlatformManifestName(): string {
  if (process.platform === 'darwin') {
    return 'latest-mac.yml'
  }
  if (process.platform === 'linux') {
    return 'latest-linux.yml'
  }
  return 'latest.yml'
}
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Manifest chính là mục lục của một release: phiên bản, tên file asset, checksum. Updater làm việc với cặp (tag, manifest) chứ không với khái niệm mơ hồ "bản mới nhất".

## Kiểm 24 giờ một lần, nằm ở process main

Giờ sang phía máy người dùng. Hai hằng số mở đầu `src/main/updater-events.ts`:

```ts
// src/main/updater-events.ts
const AUTO_UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000
const AUTO_UPDATE_RETRY_INTERVAL_MS = 60 * 60 * 1000
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Một ngày một lần, và khi check thất bại thì thử lại sau một giờ — với backoff nhân đôi mỗi lần liên tiếp (logic nằm ở `src/main/updater/updater-scheduling.ts`), tới trần thì đứng. Vì sao timer nằm ở process main chứ không phải renderer? Comment trong `updater-scheduling.ts` trả lời thay mình: "Orca runs for days, so keep the next background check scheduled in the main process rather than tying it to relaunches or renderer lifetime." Người dùng để app mở cả tuần; check phải sống độc lập với cửa sổ.

Ngoài vòng tự động còn có kiểm thủ động từ menu app — handler nằm ở `src/main/updater/updater-menu-checks.ts`; menu item được đăng ký trong `src/main/menu/register-app-menu.ts`, và callback nối trong `src/main/startup/main-process-i18n-menu.ts` chuyển cú bấm vào handler đó.

## Pin feed theo tag cụ thể: cửa sổ phát hành không làm ai tải dở

Phần thú vị nhất nằm ở chỗ này: lúc một release đang được đăng, atom feed có thể đã thấy tag trong khi manifest chưa upload xong. Nếu updater đọc feed xong lập tức đi theo URL "latest", nó có thể đọc manifest của bản này rồi tải asset của bản khác. Code xử lý bằng cách tự đi và tự pin — docstring nguyên văn của `src/main/updater-prerelease-feed.ts`:

```ts
/**
 * Walks the GitHub releases atom feed and returns the tag of the newest
 * release strictly greater than `currentVersion`.
 *
 * Why: electron-updater's GitHubProvider filters the feed by channel, and
 * GitHub's /latest/download redirect can move between check and download.
 * By resolving the newest tag ourselves and pinning the generic provider at
 * `/releases/download/<tag>`, the manifest and downloaded asset stay tied to
 * the same release.
 */
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

URL được pin là đường ghép từ tag: `getReleaseDownloadUrl(tag)` nối `RELEASES_DOWNLOAD_BASE` với tag đã encode — đúng dạng `…/releases/download/v1.4.199`. Trước khi pin, updater còn thăm dò manifest của tag đó:

```ts
// src/main/updater-prerelease-feed.ts
export type FetchNewerReleaseTagsResult =
  | { tags: string[]; state: 'ready' }
  | { tags: string[]; state: 'no-newer' }
  | { tags: string[]; state: 'not-ready'; lastGoodTag?: string }
  | { tags: string[]; state: 'unavailable'; unavailableReason: 'feed' | 'manifest' }
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Bốn trạng thái kể trọn câu chuyện của "cửa sổ phát hành": `ready` — tag mới có manifest, pin an toàn; `not-ready` — feed thấy tag nhưng manifest chưa xong, và type giữ sẵn `lastGoodTag` để lùi về tag tốt đã biết thay vì báo lỗi; `unavailable` — feed hay manifest gãy, check này bỏ qua và hẹn lần sau.

```ascii
t0   release v1.4.199 được đăng
     ├── atom feed hiện tag mới
     └── assets đang upload dở (dmg xong trước, manifest chưa)
                        │
t1   máy người dùng (đang chạy v1.4.198) check định kỳ
     đọc atom feed → thấy v1.4.199 mới hơn
     thăm dò manifest của tag: …/download/v1.4.199/latest-mac.yml
     ├── chưa sẵn sàng → giữ last-good, hẹn check sau
     └── sẵn sàng     → pin feed = …/download/v1.4.199 → "có bản mới"
                        │
t2   tải manifest + asset từ đúng tag đã pin → "ready"
                        │
t3   quit-and-install: renderer kịp flush → quit → installer → relaunch
```
*Tổng hợp từ `src/main/updater-prerelease-feed.ts`, `src/main/updater-events.ts`, `src/main/updater/updater-download-install.ts` — repo `wakii-dev/wakii`, lấy 2026-09-08.*

Một ghi chú thẳng thắn: Wakii là fork, và hằng số feed trong file nguồn trỏ về atom feed của repo gốc upstream — nguyên trạng từ lúc fork, đúng như [bài về việc giữ cập nhật với upstream](/vi/blog/forking-an-ide-keeping-current-with-upstream/) đã kể bối cảnh. Điều đáng rút ra là cơ chế: feed chỉ cần trả đúng hai thứ — tag và manifest — và mọi quyết định phía client đều dựa trên cặp đó, không phụ thuộc host nào cả.

## Từ "ready" tới "đã cài": những chốt trước khi thoát app

Tải xong chưa có nghĩa là cài ngay. Chốt đầu tiên nằm ở thời điểm thoát: thay vì gọi `quitAndInstall` ngay trong luồng IPC đang chạy, updater hoãn một nhịp:

```ts
// src/main/updater/updater-download-install.ts
// Why: defer the quit a tick so the renderer can flush dismissals/state before windows start closing.
this.pendingQuitAndInstallTimer = setTimeout(() => {
  void this.performQuitAndInstall()
}, QUIT_AND_INSTALL_DELAY_MS)
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Trên macOS, trạng thái installer được theo dõi riêng trong `src/main/updater-mac-install.ts` (nhìn vào `isMacInstallerReady`) để app không thoát trước khi installer thực sự sẵn sàng. Trên Linux, nếu bản cài hiện tại thuộc quyền quản lý của package manager của hệ điều hành, updater chặn luôn download và trả lỗi có mã — kèm comment xương:

```ts
// src/main/updater/updater-download-install.ts
// Why: main owns this verdict, not the card — an older renderer or a direct IPC call must not be
// able to spend a package download that this host could never install.
if (isExternallyManagedLinuxInstall()) {
  recordUpdaterLifecycle('linux_package_externally_managed_download_blocked', {
    version
  })
```
*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Dòng comment đó là toàn bộ triết lý của lớp này gói trong hai câu: quyết định thuộc về process main, không thuộc về thẻ UI — một renderer cũ hay một lời IPC gọi trực tiếp không được phép đốt một lượt download package mà máy này không bao giờ cài được. Còn khi app đang chạy ở chế độ serve headless, cổng `deferHeadlessServeInstall` trong `src/main/updater/updater-install-execution.ts` hoãn việc cài lại, để phiên đang chạy không bị cắt ngang.

Tổng hợp các chốt:

| Trường hợp | Updater làm gì | Nơi quyết định |
| --- | --- | --- |
| Renderer đang có IPC dở dang | hoãn quit một nhịp rồi mới cài | `updater-download-install.ts` |
| macOS installer chưa sẵn sàng | theo dõi trạng thái, thoát sau | `updater-mac-install.ts` |
| Linux do package manager quản lý | chặn download, trả lỗi có mã | `updater-download-install.ts` |
| App đang serve headless | hoãn cài, giữ phiên chạy | `serve-update-handoff.ts` |

*Nguồn: repo công khai `wakii-dev/wakii`, lấy 2026-09-08.*

Trạng thái sau mỗi bước đi về renderer bằng một object `UpdateStatus` — đúng hợp đồng dùng chung đã bảng ở [bài mô hình process](/vi/blog/arch-electron-process-model/); thẻ cập nhật trong app còn biết mình tụt lại bao nhiêu bản nhờ trường `releasesBehind` nằm cùng file đó. Vì sao có hai bản một ngày thì là chuyện của [nhịp phát hành](/vi/blog/shipping-cadence-two-releases-one-day/); bài này chỉ hỏi điều khác: sau khi tag được đăng, trên máy bạn, mọi bước đều có chốt. Muốn tự kiểm app đang chạy bản nào: [hướng dẫn cài đặt](/vi/docs/getting-started/) ghi rõ các bước, và bản mới nhất luôn nằm ở trang [tải xuống](/vi/download/).
