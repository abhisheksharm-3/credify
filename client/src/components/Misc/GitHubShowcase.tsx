import React, { useState, useEffect } from 'react';
import { Github, Star, GitFork, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RepoStats {
  stars: number;
  forks: number;
  watchers: number;
}

const GitHubShowcase = ({ repoUrl }: { repoUrl: string }) => {
  const [repoStats, setRepoStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepoStats = async () => {
      setLoading(true);
      try {
        const repoPath = new URL(repoUrl).pathname.slice(1);
        const response = await fetch(`https://api.github.com/repos/${repoPath}`);
        const data = await response.json();
        setRepoStats({
          stars: data.stargazers_count,
          forks: data.forks_count,
          watchers: data.watchers_count,
        });
      } catch (error) {
        console.error('Error fetching repo stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoStats();
  }, [repoUrl]);

  const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: number, label: string }) => (
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{value.toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Explore Our Code</CardTitle>
        <CardDescription>Dive into our open-source project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">Open Source</Badge>
          <Badge variant="secondary">Collaborative</Badge>
          <Badge variant="secondary">Innovative</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Contribute to the future of AI-powered content verification and join our community of developers.
        </p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : repoStats ? (
          <div className="flex items-center justify-around">
            <StatItem icon={Star} value={repoStats.stars} label="Stars" />
            <StatItem icon={GitFork} value={repoStats.forks} label="Forks" />
            <StatItem icon={Eye} value={repoStats.watchers} label="Watchers" />
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => window.open(repoUrl, '_blank')} className="w-full">
          <Github className="mr-2 h-4 w-4" />
          View on GitHub
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GitHubShowcase;