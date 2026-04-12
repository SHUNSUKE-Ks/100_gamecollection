
#AssetOrderList.jsonc
カジュアルゲーム用一枚アセット管理シートです。
初期は指定がない限り、SVGでスケールとポジションを合わせてUIとゲーム素材をデモ用に作成してください。

以下はサンプルです。
" 
{
  // 🎯 ゲーム共通のアセット発注書（画像・BGM・SE）
  "ASSET_ORDER": {
    // ===== タイトル画面 =====
    "TITLE": {
      // 背景・ロゴ・ボタン
      "TITLE_BG": "title_bg_1920x1080.png",       
      "TITLE_LOGO": "title_logo_800x300.png",     
      "START_BUTTON": "start_button_300x100.png", 
      "OPTION_BUTTON": "option_button_200x80.png",

      // 音声
      "BGM": "bgm_title_theme.mp3",               // タイトルBGM
      "SE_START": "se_button_start.mp3"           // 開始ボタン押下音
    },

    // ===== チュートリアル画面 =====
    "TUTORIAL": {
      "TUTORIAL_BG": "tutorial_bg_1920x1080.png", 
      "ARROW_GUIDE": "arrow_guide_100x100.png",   
      "TAP_ICON": "tap_icon_80x80.png",

      "BGM": "bgm_tutorial.mp3",                  // チュートリアル用BGM
      "SE_TAP": "se_tap.mp3"                      // タップ音
    },

    // ===== プレイ中画面 =====
    "PLAYING": {
      "GAME_BG": "game_bg_stage1_1920x1080.png",  
      "PLAYER_SPRITE": "player_sprite_64x64.png", 
      "ENEMY_SPRITE": "enemy_sprite_64x64.png",   
      "ITEM_SPRITE": "item_sprite_32x32.png",

      "BGM": "bgm_stage1.mp3",                    // ステージBGM
      "SE_ATTACK": "se_attack.mp3",               // 攻撃音
      "SE_DAMAGE": "se_damage.mp3",               // ダメージ音
      "SE_ITEM_GET": "se_item_get.mp3"            // アイテム取得音
    },

    // ===== リザルト画面 =====
    "RESULT": {
      "RESULT_BG": "result_bg_1920x1080.png",     
      "RESULT_PANEL": "result_panel_600x400.png", 
      "RETRY_BUTTON": "retry_button_300x100.png", 
      "TITLE_BUTTON": "title_button_300x100.png",

      "BGM": "bgm_result.mp3",                    // リザルトBGM
      "SE_SCORE_COUNT": "se_score_count.mp3"      // スコア加算音
    },

    // ===== 共通UIパーツ =====
    "COMMON_UI": {
      "HP_BAR": "hp_bar_400x40.png",              
      "SCORE_PANEL": "score_panel_200x80.png",    
      "PAUSE_BUTTON": "pause_button_80x80.png",

      "SE_PAUSE": "se_pause.mp3",                  // ポーズ時SE
      "SE_BUTTON": "se_button_click.mp3"           // 共通ボタンクリック音
    }
  }
}


