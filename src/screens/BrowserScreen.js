import { useContext, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';
import { detectPageType, slugToTitle } from '../utils/URLDetector';
import FloatingHeartButton from '../components/FloatingHeartButton';

// Script CSS et JavaScript à injecter pour améliorer l'ergonomie mobile/tablette
const INJECTED_JAVASCRIPT = `
  (function() {
    // Variable pour stocker les chapitres lus
    let readChapters = [];
    
    // Fonction pour recevoir les chapitres lus depuis React Native
    window.setReadChapters = function(chapters) {
      readChapters = chapters || [];
      markReadChapters();
    };
    
    // Fonction pour marquer les chapitres comme lus
    function markReadChapters() {
      // Liste des sélecteurs pour les liens de chapitres
      const chapterSelectors = [
        'a[href*="/translatedtales/"]',
        'a[href*="/chapitre-"]',
        '.chapter-list a',
        '.post-list a',
        'article a',
        '.entry-content a'
      ];
      
      chapterSelectors.forEach(selector => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          const href = link.href;
          if (href && (href.includes('/translatedtales/') || href.includes('/chapitre-'))) {
            // Vérifier si c'est un chapitre lu
            const isRead = readChapters.some(ch => ch.url === href);
            
            if (isRead && !link.querySelector('.read-indicator')) {
              // Ajouter l'indicateur de chapitre lu
              const indicator = document.createElement('span');
              indicator.className = 'read-indicator';
              indicator.innerHTML = ' ✓';
              indicator.style.cssText = \`
                color: #4CAF50 !important;
                font-weight: bold !important;
                margin-left: 5px !important;
                font-size: 14px !important;
                display: inline-block !important;
                background: rgba(76, 175, 80, 0.1) !important;
                padding: 2px 6px !important;
                border-radius: 3px !important;
              \`;
              
              // Ajouter après le lien ou comme badge
              if (link.parentElement.tagName === 'LI' || link.parentElement.tagName === 'DIV') {
                link.parentElement.style.display = 'flex';
                link.parentElement.style.justifyContent = 'space-between';
                link.parentElement.style.alignItems = 'center';
                indicator.style.marginLeft = '10px';
                link.parentElement.appendChild(indicator);
              } else {
                link.appendChild(indicator);
              }
              
              // Rendre le lien légèrement grisé
              link.style.opacity = '0.8';
              link.style.textDecoration = 'line-through';
            }
          }
        });
      });
    }
    
    // Attendre que la page soit chargée
    function initializePage() {
      // Demander les chapitres lus à React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'getReadChapters'
      }));
      
      // Créer et injecter le CSS
      const style = document.createElement('style');
      style.textContent = \`
        /* ===== MODE LECTURE ÉPURÉ ===== */
        
        /* Cacher éléments inutiles */
        aside,
        .sidebar,
        .widget-area,
        .ads,
        .advertisement,
        .ad-container,
        [class*="ad-"],
        [id*="ad-"],
        .sharedaddy,
        .related-posts,
        iframe[src*="ads"],
        iframe[src*="doubleclick"] {
          display: none !important;
        }
        
        /* ===== AMÉLIORATION LISIBILITÉ ===== */
        
        /* Texte général */
        body {
          font-size: 18px !important;
          line-height: 1.8 !important;
        }
        
        /* Contenu des chapitres */
        .entry-content,
        .chapter-content,
        article p {
          font-size: 18px !important;
          line-height: 1.9 !important;
          margin-bottom: 1.2em !important;
        }
        
        /* ===== INDICATEURS CHAPITRES LUS ===== */
        
        /* Amélioration des listes de chapitres */
        .chapter-list,
        .post-list,
        .entry-content ul,
        .entry-content ol {
          padding-left: 0 !important;
        }
        
        .chapter-list li,
        .post-list li,
        .entry-content li {
          margin-bottom: 8px !important;
          padding: 8px 12px !important;
          border-radius: 4px !important;
          transition: background-color 0.2s !important;
        }
        
        .chapter-list li:hover,
        .post-list li:hover,
        .entry-content li:hover {
          background-color: rgba(233, 30, 99, 0.05) !important;
        }
        
        /* Chapitres lus */
        .chapter-list a[href*="read"],
        .entry-content a.read {
          opacity: 0.7 !important;
          text-decoration: line-through !important;
          color: #666 !important;
        }
        
        /* Responsive tablette */
        @media (min-width: 768px) {
          .entry-content,
          .chapter-content,
          article {
            max-width: 800px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding: 40px !important;
          }
          
          body {
            font-size: 20px !important;
          }
          
          .entry-content p,
          .chapter-content p {
            font-size: 20px !important;
            line-height: 2 !important;
          }
        }
        
        /* Optimisations mobile */
        @media (max-width: 767px) {
          .entry-content,
          .chapter-content,
          article {
            padding: 15px !important;
          }
          
          /* Boutons navigation plus gros */
          .navigation a,
          .post-navigation a,
          .chapter-nav a {
            padding: 15px 20px !important;
            font-size: 16px !important;
            min-height: 48px !important;
          }
        }
        
        /* Images */
        img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 4px !important;
        }
        
        /* Liens */
        a {
          color: #e91e63 !important;
          text-decoration: none !important;
        }
        
        a:active,
        a:focus {
          opacity: 0.7 !important;
        }
      \`;
      
      document.head.appendChild(style);
      
      // Observer les changements dans la page (pour SPA)
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            // Attendre un peu que le contenu soit chargé
            setTimeout(markReadChapters, 500);
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Envoyer signal que le style est appliqué
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'styleApplied'
      }));
    }
    
    // Initialiser immédiatement ou attendre le chargement
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializePage);
    } else {
      initializePage();
    }
    
    // Aussi après le chargement complet
    window.addEventListener('load', function() {
      setTimeout(initializePage, 1000);
    });
  })();
    
    // Intercepter les changements de titre
    const observer = new MutationObserver(function(mutations) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'titleChanged',
        title: document.title
      }));
    });
    
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        subtree: true,
        characterData: true,
        childList: true
      });
    }
    
  })();
  true; // Important: retourner true
`;

const BrowserScreen = ({ route }) => {
    const webViewRef = useRef(null);
    const { 
        markChapterAsRead, 
        isFavorite, 
        addFavorite, 
        removeFavorite 
    } = useContext(StorageContext);
    
    const initialUrl = route?.params?.initialUrl || 'https://chireads.com';
    
    const [currentUrl, setCurrentUrl] = useState(initialUrl);
    const [currentTitle, setCurrentTitle] = useState('ChiReads');
    const [currentSeries, setCurrentSeries] = useState(null);
    const [showHeartButton, setShowHeartButton] = useState(false);
    const [loading, setLoading] = useState(true);

    /**
     * Gestion de la navigation dans la WebView
     */
    const handleNavigationStateChange = (navState) => {
        const { url, title } = navState;
        
        setCurrentUrl(url);
        setCurrentTitle(title || 'ChiReads');
        
        // Détecter le type de page
        const pageInfo = detectPageType(url);
        
        switch (pageInfo.type) {
            case 'series':
                // Page d'une série → afficher bouton coeur
                setShowHeartButton(true);
                setCurrentSeries({
                    url: pageInfo.seriesUrl,
                    title: title || slugToTitle(pageInfo.seriesSlug),
                    slug: pageInfo.seriesSlug
                });
                break;
                
            case 'chapter':
                // Page d'un chapitre → marquer comme lu automatiquement
                setShowHeartButton(false);
                markChapterAsRead(pageInfo.seriesUrl, {
                    url: pageInfo.chapterUrl,
                    title: title || 'Chapitre'
                });
                break;
                
            default:
                setShowHeartButton(false);
                setCurrentSeries(null);
                break;
        }
    };

    /**
     * Gestion des messages envoyés par la WebView
     */
    const handleMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            
            if (message.type === 'styleApplied') {
                console.log('CSS injecté avec succès');
            } else if (message.type === 'titleChanged') {
                setCurrentTitle(message.title);
            }
        } catch (error) {
            // Message non-JSON, ignorer
        }
    };

    /**
     * Gestion du bouton coeur (toggle favori)
     */
    const handleHeartPress = () => {
        if (!currentSeries) return;
        
        if (isFavorite(currentSeries.url)) {
            removeFavorite(currentSeries.url);
        } else {
            addFavorite(currentSeries);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* WebView plein écran */}
            <WebView
                ref={webViewRef}
                source={{ uri: initialUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                onMessage={handleMessage}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                cacheEnabled={true}
                style={styles.webview}
                userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            />
            
            {/* Indicateur de chargement */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e91e63" />
                </View>
            )}
            
            {/* Bouton coeur flottant (visible uniquement sur pages séries) */}
            {showHeartButton && currentSeries && (
                <FloatingHeartButton
                    isActive={isFavorite(currentSeries.url)}
                    onPress={handleHeartPress}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    webview: {
        flex: 1
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }
});

export default BrowserScreen;
