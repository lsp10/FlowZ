import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VersionInfo {
  appVersion: string;
  appName: string;
  buildDate: string;
  singBoxVersion: string;
}

export function AboutSettings() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      setLoading(true);
      const { getVersionInfo } = await import('@/bridge/api-wrapper');
      const response = await getVersionInfo();
      if (response && response.success && response.data) {
        setVersionInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load version info:', error);
      toast.error(t('settings.about.loadVersionFail'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('settings.about.appVersion')}
              </h4>
              <p className="text-lg font-semibold">
                {versionInfo?.appName || 'FlowZ'} v{versionInfo?.appVersion || '1.0.0'}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                sing-box {t('settings.about.version')}
              </h4>
              <p className="text-lg font-semibold">{versionInfo?.singBoxVersion || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
