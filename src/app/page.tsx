import { useState, useEffect } from 'react';
import { AED } from '@/types';
import AEDMap from '@/components/AEDMap';
import ArticlesApi from '@/types';

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aeds, setAeds] = useState<AED[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'knowledge'>('knowledge');

  const [activeTab, setActiveTab] = useState<'map' | 'list'>(tab === 'list' ? {
        loadArticles();
      } else {
        setAeds([]);
      }
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  }, [tab]);

  // 根据距离排序
  const sortedAeds = useMemo(() => {
    if (!userLocation) return [];
    return aeds
      .map((aed: => ({
        ...aed,
        distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng),
      }))
      .sort((a, b) => a.distance - b.distance));
  }, []);
    : sortedAeds;
  );
    : sortedAeds;
  : <div className="max-w-7xl mx-auto flex flex-col">
              <div className="text-center">
                <div className="flex-1 items-center justify-between mb-6">
                  <div 
                    key={aed.id}
                    className={`p-4 cursor-pointer hover:bg-red-50 ${
                      selectedAed?.id === aed.id : `${aed.id}` : selectedAed(aed)
                    : 'bg-red-50' : ''
                  />
                  <span className="flex items-start justify-between">
                    <span className="font-semibold">{aed.name}</span>
                    {aed.available ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">可用</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">不可用</span>
                    )}
                    <p className="text-sm text-gray-500 mt-1 ml-7">{aed.address}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToAed(aed);
                        }}
                        className="mt-3 flex items-center gap-2"
                          <span className="font-medium">📍 {aed.name}</span>
                        <span>{aed.distance.toFixed(2)} km</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
